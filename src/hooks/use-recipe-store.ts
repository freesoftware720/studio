"use client";

import { useCallback } from 'react';
import type { Recipe } from '@/lib/types';
import { useLocalStorage } from './use-local-storage';

const MAX_HISTORY_ITEMS = 50;

export function useRecipeStore() {
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('smartchef-recipes', []);

  const addRecipeToHistory = useCallback((newRecipe: Omit<Recipe, 'id' | 'createdAt' | 'isFavorite'>, userInput: Recipe['userInput']) => {
    const recipeWithMetadata: Recipe = {
      ...newRecipe,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      isFavorite: false,
      userInput,
    };

    setRecipes(prevRecipes => {
      const updatedRecipes = [recipeWithMetadata, ...prevRecipes.filter(r => r.id !== recipeWithMetadata.id)];
      return updatedRecipes.slice(0, MAX_HISTORY_ITEMS);
    });
    return recipeWithMetadata;
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
    recipes, // all recipes (for direct access if needed, mainly for history & fav derivation)
    favorites,
    history,
    addRecipeToHistory,
    toggleFavorite,
    removeRecipe,
    getRecipeById,
  };
}
