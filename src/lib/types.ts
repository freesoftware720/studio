
import type { GenerateRecipeOutput, GenerateRecipeInput } from '@/ai/flows/generate-recipe';

export interface Recipe extends GenerateRecipeOutput {
  id: string;
  createdAt: number; // Timestamp for history
  isFavorite: boolean;
  // User inputs that generated this recipe, for context if needed
  userInput?: GenerateRecipeInput; // Re-using GenerateRecipeInput for userInput fields
}

export type RecipeQuestionContext = {
  recipeTitle: string;
  recipeIngredients: string[];
  recipeInstructions: string[];
};
