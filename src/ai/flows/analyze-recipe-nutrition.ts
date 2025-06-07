
'use server';
/**
 * @fileOverview Analyzes a recipe for estimated nutritional information and health tips.
 *
 * - analyzeRecipeNutrition - A function that takes recipe details and returns nutritional estimates.
 * - AnalyzeRecipeNutritionInput - The input type for the analyzeRecipeNutrition function.
 * - AnalyzeRecipeNutritionOutput - The return type for the analyzeRecipeNutrition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeRecipeNutritionInputSchema = z.object({
  title: z.string().describe('The title of the recipe.'),
  ingredients: z.array(z.string()).describe('A list of ingredients for the recipe.'),
  instructions: z.array(z.string()).describe('The preparation instructions for the recipe.'),
});
export type AnalyzeRecipeNutritionInput = z.infer<typeof AnalyzeRecipeNutritionInputSchema>;

const AnalyzeRecipeNutritionOutputSchema = z.object({
  estimatedCalories: z.number().describe('Estimated total calories for the recipe (e.g., per serving or for the whole dish). Specify if per serving or total.'),
  proteinGrams: z.number().describe('Estimated grams of protein.'),
  carbsGrams: z.number().describe('Estimated grams of carbohydrates.'),
  fatGrams: z.number().describe('Estimated grams of fat.'),
  healthTips: z.array(z.string()).describe('Relevant health tips or considerations for the recipe (e.g., "Good source of fiber", "Can be made lower sodium by..."). Provide 2-3 concise tips.'),
  disclaimer: z.string().describe('A brief disclaimer stating that these are AI-generated estimates and not a substitute for professional advice.').default("Nutritional information is AI-estimated and may not be accurate. Consult a nutritionist for precise data."),
});
export type AnalyzeRecipeNutritionOutput = z.infer<typeof AnalyzeRecipeNutritionOutputSchema>;

export async function analyzeRecipeNutrition(input: AnalyzeRecipeNutritionInput): Promise<AnalyzeRecipeNutritionOutput> {
  return analyzeRecipeNutritionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRecipeNutritionPrompt',
  input: {schema: AnalyzeRecipeNutritionInputSchema},
  output: {schema: AnalyzeRecipeNutritionOutputSchema},
  prompt: `You are a nutritional analysis AI. Analyze the following recipe and provide estimated nutritional information and health tips.
IMPORTANT: Your estimations should be reasonable for the ingredients provided.

Recipe Title: {{{title}}}

Ingredients:
{{#each ingredients}}
- {{{this}}}
{{/each}}

Instructions:
{{#each instructions}}
{{@index_1}}. {{{this}}}
{{/each}}

Provide your analysis based on the schema.
For calories, clearly state if it's per serving (assume a reasonable number of servings like 2-4 based on ingredients) or for the entire dish.
Health tips should be actionable or informative.
`,
});

const analyzeRecipeNutritionFlow = ai.defineFlow(
  {
    name: 'analyzeRecipeNutritionFlow',
    inputSchema: AnalyzeRecipeNutritionInputSchema,
    outputSchema: AnalyzeRecipeNutritionOutputSchema,
  },
  async (input) => {
    // Using a more capable model for potentially complex analysis
    const {output} = await prompt(input, {model: 'googleai/gemini-2.0-flash'}); 
    return output!;
  }
);
