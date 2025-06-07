
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Recipe, UserPreferences } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import type { GenerateRecipeInput } from '@/ai/flows/generate-recipe';
import type { PostgrestError } from '@supabase/supabase-js';

export function useRecipeStore() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  const getCurrentUserId = async (): Promise<string | undefined> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  };

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const userId = await getCurrentUserId();

    if (!userId) {
      setRecipes([]);
      setPreferences(null);
      setLoading(false);
      // Consider setting an error or handling anonymous state if needed
      // setError({ message: 'User not authenticated', details: '', hint: '', code: '401' });
      return;
    }

    // Fetch recipes
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (recipeError) {
      setError(recipeError);
      setRecipes([]);
    } else {
      const parsedRecipes = recipeData?.map(r => ({
        ...r,
        id: r.id,
        userId: r.user_id,
        // Ensure created_at is a number (timestamp)
        createdAt: new Date(r.created_at).getTime(),
        // Parse JSON string fields if necessary
        ingredients: typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : r.ingredients,
        instructions: typeof r.instructions === 'string' ? JSON.parse(r.instructions) : r.instructions,
        userInput: typeof r.user_input === 'string' ? JSON.parse(r.user_input) : r.user_input,
        isFavorite: r.is_favorite,
        imageUrl: r.image_url,
      } as Recipe)) || [];
      setRecipes(parsedRecipes);
    }

    // Fetch preferences
    const { data: prefData, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (prefError) {
      // Append to existing error if recipeError also occurred
      setError(prevError => prevError ? { ...prevError, ...prefError, message: `${prevError.message}; ${prefError.message}` } : prefError);
      setPreferences(null);
    } else {
      setPreferences(prefData as UserPreferences | null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUserData();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Re-fetch data if user logs in or out
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchUserData();
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserData]);

  const saveRecipe = useCallback(async (
    recipeCoreData: Omit<Recipe, 'id' | 'createdAt' | 'isFavorite' | 'imageUrl' | 'userId' | 'userInput'>,
    userInputData: GenerateRecipeInput
  ): Promise<Recipe | null> => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setError({ message: 'User not authenticated for saving recipe.', details: '', hint: '', code: '401' });
      return null;
    }

    const recipeToSaveToDb = {
      user_id: userId,
      // created_at is handled by Supabase default or trigger
      title: recipeCoreData.title,
      ingredients: recipeCoreData.ingredients, // Assumes these are arrays/objects suitable for JSONB
      instructions: recipeCoreData.instructions,
      is_favorite: false, // Default
      user_input: userInputData,
      // imageUrl is updated separately
    };

    const { data: savedData, error: insertError } = await supabase
      .from('recipes')
      .insert(recipeToSaveToDb)
      .select()
      .single();

    if (insertError) {
      console.error("Error saving recipe to Supabase. Details:", {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code,
        rawError: insertError 
      });
      setError(insertError);
      return null;
    }

    if (savedData) {
      const newRecipe: Recipe = {
        id: savedData.id,
        userId: savedData.user_id,
        createdAt: new Date(savedData.created_at).getTime(),
        title: savedData.title,
        ingredients: savedData.ingredients, // Assume Supabase returns them parsed if JSONB
        instructions: savedData.instructions,
        isFavorite: savedData.is_favorite,
        imageUrl: savedData.image_url,
        userInput: savedData.user_input,
      };
      setRecipes(prev => [newRecipe, ...prev]);
      return newRecipe;
    }
    return null;
  }, []);

  const toggleFavorite = useCallback(async (recipeId: string): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setError({ message: 'User not authenticated for toggling favorite.', details: '', hint: '', code: '401' });
      return;
    }

    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const newFavStatus = !recipe.isFavorite;
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ is_favorite: newFavStatus })
      .eq('id', recipeId)
      .eq('user_id', userId);

    if (updateError) {
      setError(updateError);
    } else {
      setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, isFavorite: newFavStatus } : r));
    }
  }, [recipes]);

  const updateRecipeImage = useCallback(async (recipeId: string, imageUrl: string): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setError({ message: 'User not authenticated for updating image.', details: '', hint: '', code: '401' });
      return;
    }
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ image_url: imageUrl })
      .eq('id', recipeId)
      .eq('user_id', userId);

    if (updateError) {
      setError(updateError);
    } else {
      setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, imageUrl } : r));
    }
  }, []);

  const removeRecipe = useCallback(async (recipeId: string): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setError({ message: 'User not authenticated for removing recipe.', details: '', hint: '', code: '401' });
      return;
    }
    const { error: deleteError } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId)
      .eq('user_id', userId);

    if (deleteError) {
      setError(deleteError);
    } else {
      setRecipes(prev => prev.filter(r => r.id !== recipeId));
    }
  }, []);

  const getPreferences = useCallback(async (): Promise<UserPreferences | null> => {
    const userId = await getCurrentUserId();
    if (!userId) {
      // setError({ message: 'User not authenticated for getting preferences.', details: '', hint: '', code: '401' });
      setPreferences(null);
      return null;
    }
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    setLoading(false);
    if (fetchError) {
      setError(fetchError);
      setPreferences(null);
      return null;
    }
    setPreferences(data as UserPreferences | null);
    return data as UserPreferences | null;
  }, []);
  
  const savePreferences = useCallback(async (newPreferences: UserPreferences): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setError({ message: 'User not authenticated for saving preferences.', details: '', hint: '', code: '401' });
      return;
    }
    // Ensure user_id is part of the object being upserted if it's not a PK handled by RLS implicitly
    const preferencesToSave = { ...newPreferences, user_id: userId };

    const { error: upsertError } = await supabase
      .from('user_preferences')
      .upsert(preferencesToSave, { onConflict: 'user_id' });

    if (upsertError) {
      setError(upsertError);
    } else {
      setPreferences(newPreferences); // Optimistically update local state
    }
  }, []);

  const getRecipeById = useCallback((recipeId: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === recipeId);
  }, [recipes]);

  const favorites = recipes.filter(recipe => recipe.isFavorite).sort((a, b) => b.createdAt - a.createdAt);
  // History is essentially all recipes fetched, already sorted by Supabase query or client-side
  const history = [...recipes].sort((a, b) => b.createdAt - a.createdAt);


  return {
    recipes, // The raw list of recipes for the current user
    favorites, // Derived: Filtered and sorted favorite recipes
    history,   // Derived: All recipes for the user, sorted by creation date
    preferences, // Current user's preferences
    loading,
    error,
    
    // Functions:
    getUserRecipes: fetchUserData, // Function to explicitly re-fetch all recipes and preferences for the user
    saveRecipe,
    toggleFavorite,
    removeRecipe,
    updateRecipeImage,
    getPreferences, // Fetches and returns preferences, also updates local state
    savePreferences, // Saves/updates preferences

    // Utility
    getRecipeById,
  };
}

