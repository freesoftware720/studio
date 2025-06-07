
import type { GenerateRecipeOutput, GenerateRecipeInput as GenRecipeInputType } from '@/ai/flows/generate-recipe'; // Renamed to avoid conflict
import type { AnalyzeRecipeNutritionOutput } from '@/ai/flows/analyze-recipe-nutrition';

// Explicitly define GenerateRecipeInput here if it's different or needs extension locally
// For now, we assume GenRecipeInputType from the flow is sufficient.
export type RecipeGenerationUserInput = GenRecipeInputType;


export interface Recipe extends GenerateRecipeOutput {
  id: string;
  userId?: string; 
  createdAt: number; 
  isFavorite: boolean;
  imageUrl?: string; 
  userInput?: RecipeGenerationUserInput; 
  nutritionInfo?: AnalyzeRecipeNutritionOutput; 
}

export interface UserPreferences {
  cuisine?: string;
  mealType?: string;
  dietaryRestrictions?: string;
  language?: string;
}

export type RecipeQuestionContext = {
  recipeTitle: string;
  recipeIngredients: string[];
  recipeInstructions: string[];
};

