
"use client";

import { useCallback } from 'react';
import type { Recipe } from '@/lib/types';
import { useLocalStorage } from './use-local-storage';

const MAX_HISTORY_ITEMS = 50;

export function useRecipeStore() {
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('smartchef-recipes', []);

  const addRecipeToHistory = useCallback((newRecipeData: Omit<Recipe, 'id' | 'createdAt' | 'isFavorite' | 'imageUrl'>, userInput: Recipe['userInput']) => {
    const recipeWithMetadata: Recipe = {
      ...newRecipeData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      isFavorite: false,
      userInput,
      // imageUrl will be added later
    };

    setRecipes(prevRecipes => {
      const updatedRecipes = [recipeWithMetadata, ...prevRecipes.filter(r => r.id !== recipeWithMetadata.id)];
      return updatedRecipes.slice(0, MAX_HISTORY_ITEMS);
    });
    return recipeWithMetadata;
  }, [setRecipes]);

  const updateRecipeImage = useCallback((recipeId: string, imageUrl: string) => {
    setRecipes(prevRecipes =>
      prevRecipes.map(recipe =>
        recipe.id === recipeId ? { ...recipe, imageUrl } : recipe
      )
    );
  }, [setRecipes]);

  const toggleFavorite = useCallback((recipeId: string) => {
    setRecipes(prevRecipes =>
      prevRecipes.map(recipe =>
        recipe.id === recipeId ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
      )
    );
  }, [setRecipes]);

  const removeRecipe = useCallback((recipeId: string) => {
    setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeId));
  }, [setRecipes]);
  
  const getRecipeById = useCallback((recipeId: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === recipeId);
  }, [recipes]);

  const favorites = recipes.filter(recipe => recipe.isFavorite).sort((a, b) => b.createdAt - a.createdAt);
  const history = recipes.sort((a, b) => b.createdAt - a.createdAt);

  return {
    recipes,
    favorites,
    history,
    addRecipeToHistory,
    toggleFavorite,
    removeRecipe,
    getRecipeById,
    updateRecipeImage,
  };
}
