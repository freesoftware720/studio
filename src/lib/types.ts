
import type { GenerateRecipeOutput, GenerateRecipeInput } from '@/ai/flows/generate-recipe';
import type { AnalyzeRecipeNutritionOutput } from '@/ai/flows/analyze-recipe-nutrition'; // New import

export interface Recipe extends GenerateRecipeOutput {
  id: string;
  userId?: string; // Associated user ID from Supabase
  createdAt: number; // Timestamp for history (client-side representation)
  isFavorite: boolean;
  imageUrl?: string; // Optional URL for the AI-generated image
  userInput?: GenerateRecipeInput; // Inputs used to generate the recipe
  nutritionInfo?: AnalyzeRecipeNutritionOutput; // New field for nutrition
}

export interface UserPreferences {
  // user_id is typically the primary key in Supabase table and handled via session
  cuisine?: string;
  mealType?: string;
  dietaryRestrictions?: string;
  language?: string;
  // Supabase table might have 'updated_at' and 'user_id' (FK to auth.users)
}

export type RecipeQuestionContext = {
  recipeTitle: string;
  recipeIngredients: string[];
  recipeInstructions: string[];
};
