
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Recipe, UserPreferences } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import type { GenerateRecipeInput } from '@/ai/flows/generate-recipe';
import type { PostgrestError } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

// Helper function for robust parsing of JSONB fields
const parseJsonbField = <TDefaultType extends any[] | Record<string, any> | undefined>(
  fieldData: any,
  defaultValue: TDefaultType
): TDefaultType => {
  if (fieldData === null || fieldData === undefined) {
    return defaultValue;
  }
  if (typeof fieldData === 'string') {
    try {
      const parsed = JSON.parse(fieldData);
      return parsed === null && defaultValue !== undefined && defaultValue !== null ? defaultValue : parsed;
    } catch (e) {
      console.error('Failed to parse JSON string from DB:', e, fieldData);
      return defaultValue;
    }
  }
  if (typeof fieldData === 'object') {
    return fieldData;
  }
  console.warn('Unexpected data type for JSONB field, returning default:', fieldData);
  return defaultValue;
};

interface RecipeStore {
  recipes: Recipe[];
  favorites: Recipe[];
  history: Recipe[];
  preferences: UserPreferences | null;
  loading: boolean;
  error: PostgrestError | null;
  fetchUserData: () => Promise<void>;
  saveRecipe: (
    recipeCoreData: Omit<Recipe, 'id' | 'createdAt' | 'isFavorite' | 'imageUrl' | 'userId' | 'userInput'>,
    userInputData: GenerateRecipeInput
  ) => Promise<Recipe | null>;
  toggleFavorite: (recipeId: string) => Promise<void>;
  removeRecipe: (recipeId: string) => Promise<void>;
  updateRecipeImage: (recipeId: string, imageUrl: string) => Promise<void>;
  getPreferences: () => Promise<UserPreferences | null>;
  savePreferences: (newPreferences: Omit<UserPreferences, 'user_id'>) => Promise<void>;
  getRecipeById: (recipeId: string) => Recipe | undefined;
}

const RecipeContext = createContext<RecipeStore | undefined>(undefined);

export const RecipeProvider = ({ children }: { children: ReactNode }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const { toast } = useToast();

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
      toast({
        title: "Error Fetching Recipes",
        description: recipeError.message || "Could not load your recipe history.",
        variant: "destructive",
      });
    } else {
      const parsedRecipes = recipeData?.map(r => ({
        id: r.id,
        userId: r.user_id,
        createdAt: new Date(r.created_at).getTime(),
        title: r.title,
        ingredients: parseJsonbField<string[]>(r.ingredients, []),
        instructions: parseJsonbField<string[]>(r.instructions, []),
        isFavorite: r.is_favorite,
        imageUrl: r.image_url,
        userInput: parseJsonbField<GenerateRecipeInput | undefined>(r.user_input, undefined),
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
      toast({
        title: "Error Fetching Preferences",
        description: prefError.message || "Could not load your preferences.",
        variant: "destructive",
      });
    } else {
      setPreferences(prefData as UserPreferences | null);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchUserData();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
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
      toast({ title: "Authentication Error", description: "You must be logged in to save a recipe.", variant: "destructive" });
      return null;
    }

    const recipeToSaveToDb = {
      user_id: userId,
      title: recipeCoreData.title,
      ingredients: recipeCoreData.ingredients,
      instructions: recipeCoreData.instructions,
      is_favorite: false,
      user_input: userInputData,
    };

    const { data: savedData, error: insertError } = await supabase
      .from('recipes')
      .insert(recipeToSaveToDb)
      .select()
      .single();

    if (insertError) {
      console.error("Error saving recipe to Supabase. Details:", { message: insertError.message, details: insertError.details, hint: insertError.hint, code: insertError.code, rawError: insertError });
      setError(insertError);
      toast({ title: "Failed to Save Recipe", description: `${insertError.message || "Could not save the recipe."} Check console for details.`, variant: "destructive" });
      return null;
    }

    if (savedData) {
      const newRecipe: Recipe = {
        id: savedData.id,
        userId: savedData.user_id,
        createdAt: new Date(savedData.created_at).getTime(),
        title: savedData.title,
        ingredients: parseJsonbField<string[]>(savedData.ingredients, []),
        instructions: parseJsonbField<string[]>(savedData.instructions, []),
        isFavorite: savedData.is_favorite,
        imageUrl: savedData.image_url,
        userInput: parseJsonbField<GenerateRecipeInput | undefined>(savedData.user_input, undefined),
      };
      setRecipes(prev => [newRecipe, ...prev.filter(p => p.id !== newRecipe.id)]);
      return newRecipe;
    }
    return null;
  }, [toast]);

  const toggleFavorite = useCallback(async (recipeId: string): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setError({ message: 'User not authenticated for toggling favorite.', details: '', hint: '', code: '401' });
      toast({ title: "Authentication Error", description: "You must be logged in to change favorites.", variant: "destructive" });
      return;
    }

    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) {
      console.error(`Recipe with ID ${recipeId} not found in local state.`);
      toast({ title: "Error", description: "Recipe not found.", variant: "destructive" });
      return;
    }

    const newFavStatus = !recipe.isFavorite;
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ is_favorite: newFavStatus })
      .eq('id', recipeId)
      .eq('user_id', userId);

    if (updateError) {
      console.error("Error toggling favorite in Supabase. Details:", { message: updateError.message, details: updateError.details, hint: updateError.hint, code: updateError.code, rawError: updateError });
      setError(updateError);
      toast({ title: "Failed to Update Favorite", description: `${updateError.message || "Could not update favorite status."} Check console for details.`, variant: "destructive" });
    } else {
      setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, isFavorite: newFavStatus } : r));
      toast({ title: newFavStatus ? "Added to Favorites" : "Removed from Favorites", description: `"${recipe.title}" updated.`, variant: "default" });
    }
  }, [recipes, toast]);

  const updateRecipeImage = useCallback(async (recipeId: string, imageUrl: string): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setError({ message: 'User not authenticated for updating image.', details: '', hint: '', code: '401' });
      toast({ title: "Authentication Error", description: "You must be logged in to update images.", variant: "destructive" });
      return;
    }
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ image_url: imageUrl })
      .eq('id', recipeId)
      .eq('user_id', userId);

    if (updateError) {
      console.error("Error updating recipe image in Supabase. Details:", { message: updateError.message, details: updateError.details, hint: updateError.hint, code: updateError.code, rawError: updateError });
      setError(updateError);
      toast({ title: "Failed to Update Image", description: `${updateError.message || "Could not update image."} Check console for details.`, variant: "destructive" });
    } else {
      setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, imageUrl } : r));
    }
  }, [toast]);

  const removeRecipe = useCallback(async (recipeId: string): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setError({ message: 'User not authenticated for removing recipe.', details: '', hint: '', code: '401' });
      toast({ title: "Authentication Error", description: "You must be logged in to remove recipes.", variant: "destructive" });
      return;
    }
    
    const recipeToRemove = recipes.find(r => r.id === recipeId);
    const { error: deleteError } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error("Error removing recipe from Supabase. Details:", { message: deleteError.message, details: deleteError.details, hint: deleteError.hint, code: deleteError.code, rawError: deleteError });
      setError(deleteError);
      toast({ title: "Failed to Remove Recipe", description: `${deleteError.message || "Could not remove recipe."} Check console for details.`, variant: "destructive" });
    } else {
      setRecipes(prev => prev.filter(r => r.id !== recipeId));
      toast({ title: "Recipe Removed", description: `"${recipeToRemove?.title || 'The recipe'}" removed.`, variant: "default" });
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
      console.error("Error fetching preferences from Supabase. Details:", { message: fetchError.message, details: fetchError.details, hint: fetchError.hint, code: fetchError.code, rawError: fetchError });
      setError(fetchError);
      setPreferences(null);
      toast({ title: "Error Fetching Preferences", description: fetchError.message || "Could not load preferences.", variant: "destructive" });
      return null;
    }
    const userPrefs = data ? { cuisine: data.cuisine, mealType: data.mealType, dietaryRestrictions: data.dietaryRestrictions, language: data.language } : null;
    setPreferences(userPrefs as UserPreferences | null);
    return userPrefs as UserPreferences | null;
  }, [toast]);
  
  const savePreferences = useCallback(async (newPreferences: Omit<UserPreferences, 'user_id'>): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setError({ message: 'User not authenticated for saving preferences.', details: '', hint: '', code: '401' });
      toast({ title: "Authentication Error", description: "You must be logged in to save preferences.", variant: "destructive" });
      return;
    }
    
    const preferencesToSave = { ...newPreferences, user_id: userId };
    const { error: upsertError } = await supabase
      .from('user_preferences')
      .upsert(preferencesToSave, { onConflict: 'user_id' })
      .select()
      .single();

    if (upsertError) {
      console.error("Error saving preferences to Supabase. Details:", { message: upsertError.message, details: upsertError.details, hint: upsertError.hint, code: upsertError.code, rawError: upsertError });
      setError(upsertError);
      toast({ title: "Failed to Save Preferences", description: `${upsertError.message || "Could not save preferences."} Check console for details.`, variant: "destructive" });
    } else {
      setPreferences(newPreferences);
      toast({ title: "Preferences Saved", description: "Your preferences have been updated.", variant: "default" });
    }
  }, [toast]);

  const getRecipeById = useCallback((recipeId: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === recipeId);
  }, [recipes]);

  const favorites = recipes.filter(recipe => recipe.isFavorite).sort((a, b) => b.createdAt - a.createdAt);
  const history = [...recipes].sort((a, b) => b.createdAt - a.createdAt);

  const value = {
    recipes, favorites, history, preferences, loading, error,
    fetchUserData, saveRecipe, toggleFavorite, removeRecipe,
    updateRecipeImage, getPreferences, savePreferences, getRecipeById,
  };

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
};

export const useRecipeContext = () => {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipeContext must be used within a RecipeProvider');
  }
  return context;
};

    