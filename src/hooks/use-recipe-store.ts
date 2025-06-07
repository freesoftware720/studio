
"use client";

// This hook now consumes the RecipeContext.
// The actual state management logic has been moved to RecipeProvider in src/context/recipe-context.tsx.
import { useRecipeContext } from '@/context/recipe-context';

export function useRecipeStore() {
  return useRecipeContext();
}

    