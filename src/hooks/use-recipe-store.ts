
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Recipe, UserPreferences } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import type { GenerateRecipeInput } from '@/ai/flows/generate-recipe';
import type { PostgrestError } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast'; // Import useToast

export function useRecipeStore() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const { toast } = useToast(); // Initialize toast

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
      return;
    }

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
        createdAt: new Date(r.created_at).getTime(),
        ingredients: typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : r.ingredients,
        instructions: typeof r.instructions === 'string' ? JSON.parse(r.instructions) : r.instructions,
        userInput: typeof r.user_input === 'string' ? JSON.parse(r.user_input) : r.user_input,
        isFavorite: r.is_favorite,
        imageUrl: r.image_url,
      } as Recipe)) || [];
      setRecipes(parsedRecipes);
    }

    const { data: prefData, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (prefError) {
      setError(prevError => prevError ? { ...prevError, ...prefError, message: `${prevError.message}; ${prefError.message}` } : prefError);
      setPreferences(null);
    } else {
      setPreferences(prefData as UserPreferences | null);
    }
    setLoading(false);
  }, []); // Removed toast from dependencies as fetchUserData doesn't use it directly

  useEffect(() => {
    fetchUserData();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
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
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save a recipe.",
        variant: "destructive",
      });
      return null;
    }

    const recipeToSaveToDb = {
      user_id: userId,
      title: recipeCoreData.title,
      ingredients: recipeCoreData.ingredients,
      instructions: recipeCoreData.instructions,
      is_favorite: false,
      user_input: userInputData,
      // image_url will be updated separately if generated
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
      toast({
        title: "Failed to Save Recipe",
        description: `${insertError.message || "Could not save the recipe to the database."} Check console for details.`,
        variant: "destructive",
      });
      return null;
    }

    if (savedData) {
      const newRecipe: Recipe = {
        id: savedData.id,
        userId: savedData.user_id,
        createdAt: new Date(savedData.created_at).getTime(),
        title: savedData.title,
        ingredients: savedData.ingredients, // Already in correct format from DB
        instructions: savedData.instructions, // Already in correct format from DB
        isFavorite: savedData.is_favorite,
        imageUrl: savedData.image_url,
        userInput: savedData.user_input, // Already in correct format from DB
      };
      setRecipes(prev => [newRecipe, ...prev]);
      // toast for saveRecipe is handled on the page where it's called
      return newRecipe;
    }
    return null;
  }, [toast]);

  const toggleFavorite = useCallback(async (recipeId: string): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setError({ message: 'User not authenticated for toggling favorite.', details: '', hint: '', code: '401' });
      toast({
        title: "Authentication Error",
        description: "You must be logged in to change favorites.",
        variant: "destructive",
      });
      return;
    }

    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) {
      console.error(`Recipe with ID ${recipeId} not found in local state.`);
      toast({
        title: "Error",
        description: "Recipe not found.",
        variant: "destructive",
      });
      return;
    }

    const newFavStatus = !recipe.isFavorite;
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ is_favorite: newFavStatus })
      .eq('id', recipeId)
      .eq('user_id', userId);

    if (updateError) {
      console.error("Error toggling favorite in Supabase. Details:", {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code,
        rawError: updateError
      });
      setError(updateError);
      toast({
        title: "Failed to Update Favorite",
        description: `${updateError.message || "Could not update favorite status."} Check console for details.`,
        variant: "destructive",
      });
    } else {
      setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, isFavorite: newFavStatus } : r));
      toast({
        title: newFavStatus ? "Added to Favorites" : "Removed from Favorites",
        description: `"${recipe.title}" has been ${newFavStatus ? 'added to' : 'removed from'} your favorites.`,
        variant: "default",
      });
    }
  }, [recipes, toast]);

  const updateRecipeImage = useCallback(async (recipeId: string, imageUrl: string): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setError({ message: 'User not authenticated for updating image.', details: '', hint: '', code: '401' });
       toast({
        title: "Authentication Error",
        description: "You must be logged in to update images.",
        variant: "destructive",
      });
      return;
    }
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ image_url: imageUrl })
      .eq('id', recipeId)
      .eq('user_id', userId);

    if (updateError) {
      console.error("Error updating recipe image in Supabase. Details:", {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code,
        rawError: updateError
      });
      setError(updateError);
       toast({
        title: "Failed to Update Image",
        description: `${updateError.message || "Could not update recipe image."} Check console for details.`,
        variant: "destructive",
      });
    } else {
      setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, imageUrl } : r));
      // Success toast for image update is handled on the page where it's called
    }
  }, [toast]);

  const removeRecipe = useCallback(async (recipeId: string): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setError({ message: 'User not authenticated for removing recipe.', details: '', hint: '', code: '401' });
      toast({
        title: "Authentication Error",
        description: "You must be logged in to remove recipes.",
        variant: "destructive",
      });
      return;
    }
    
    const recipeToRemove = recipes.find(r => r.id === recipeId);

    const { error: deleteError } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error("Error removing recipe from Supabase. Details:", {
        message: deleteError.message,
        details: deleteError.details,
        hint: deleteError.hint,
        code: deleteError.code,
        rawError: deleteError 
      });
      setError(deleteError);
      toast({
        title: "Failed to Remove Recipe",
        description: `${deleteError.message || "Could not remove the recipe."} Check console for details.`,
        variant: "destructive",
      });
    } else {
      setRecipes(prev => prev.filter(r => r.id !== recipeId));
      toast({
        title: "Recipe Removed",
        description: `"${recipeToRemove?.title || 'The recipe'}" has been removed.`,
        variant: "default",
      });
    }
  }, [recipes, toast]);

  const getPreferences = useCallback(async (): Promise<UserPreferences | null> => {
    const userId = await getCurrentUserId();
    if (!userId) {
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
      console.error("Error fetching preferences from Supabase. Details:", {
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint,
        code: fetchError.code,
        rawError: fetchError
      });
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
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save preferences.",
        variant: "destructive",
      });
      return;
    }
    // Remove user_id from newPreferences if it exists, as it will be set by `preferencesToSave`
    // Supabase might complain if user_id is part of the upsert payload but also used in onConflict
    const { user_id, ...prefsToSaveData } = newPreferences as any; 
    const preferencesToSave = { ...prefsToSaveData, user_id: userId };


    const { error: upsertError } = await supabase
      .from('user_preferences')
      .upsert(preferencesToSave, { onConflict: 'user_id' });

    if (upsertError) {
      console.error("Error saving preferences to Supabase. Details:", {
        message: upsertError.message,
        details: upsertError.details,
        hint: upsertError.hint,
        code: upsertError.code,
        rawError: upsertError
      });
      setError(upsertError);
      toast({
        title: "Failed to Save Preferences",
        description: `${upsertError.message || "Could not save your preferences."} Check console for details.`,
        variant: "destructive",
      });
    } else {
      // Fetch the latest preferences to ensure consistency, as upsert might not return the full object
      const updatedPrefs = await getPreferences();
      if (updatedPrefs) {
         setPreferences(updatedPrefs);
      } else {
        // Fallback if getPreferences fails, though unlikely if upsert succeeded
        setPreferences(newPreferences);
      }
      toast({
        title: "Preferences Saved",
        description: "Your preferences have been updated.",
        variant: "default",
      });
    }
  }, [toast, getPreferences]); // Added getPreferences to dependency array

  const getRecipeById = useCallback((recipeId: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === recipeId);
  }, [recipes]);

  const favorites = recipes.filter(recipe => recipe.isFavorite).sort((a, b) => b.createdAt - a.createdAt);
  const history = [...recipes].sort((a, b) => b.createdAt - a.createdAt);


  return {
    recipes,
    favorites,
    history,
    preferences,
    loading,
    error,
    
    getUserRecipes: fetchUserData,
    saveRecipe,
    toggleFavorite,
    removeRecipe,
    updateRecipeImage,
    getPreferences,
    savePreferences,
    getRecipeById,
  };
}
