'use server';

/**
 * @fileOverview Generates a recipe based on user-provided ingredients and dietary preferences.
 *
 * - generateRecipe - A function that generates a recipe.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients available to the user.'),
  cuisine: z
    .string()
    .optional()
    .describe('The desired cuisine for the recipe (e.g., Italian, Mexican).'),
  mealType: z
    .string()
    .optional()
    .describe('The type of meal (e.g., breakfast, lunch, dinner).'),
  dietaryRestrictions: z
    .string()
    .optional()
    .describe('Any dietary restrictions (e.g., vegan, keto, gluten-free).'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  title: z.string().describe('The title of the generated recipe.'),
  ingredients: z.array(z.string()).describe('A list of ingredients required for the recipe.'),
  instructions: z.array(z.string()).describe('Step-by-step instructions for preparing the recipe.'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {schema: GenerateRecipeInputSchema},
  output: {schema: GenerateRecipeOutputSchema},
  prompt: `You are a recipe generation AI. Please generate a recipe based on the provided ingredients and preferences.

Ingredients: {{{ingredients}}}

{{#if cuisine}}
Cuisine: {{{cuisine}}}
{{/if}}

{{#if mealType}}
Meal Type: {{{mealType}}}
{{/if}}

{{#if dietaryRestrictions}}
Dietary Restrictions: {{{dietaryRestrictions}}}
{{/if}}

Recipe Title:

Ingredients:
- <list of ingredients>

Instructions:
1. <step-by-step instructions>

Make sure to include the ingredients and instructions in the format specified.
`,
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
