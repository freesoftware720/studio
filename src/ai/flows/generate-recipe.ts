
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
  language: z
    .string()
    .optional()
    .describe('The desired language for the recipe (e.g., Hindi, Urdu, Spanish). Default is English if not specified.'),
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
  prompt: `You are a recipe generation AI.
{{#if language}}
IMPORTANT: Generate the entire recipe (title, ingredients list, and instructions) in the specified language: {{language}}.
{{else}}
Generate the recipe in English.
{{/if}}

Based on the following details:

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

Format the output as follows:

Recipe Title: <The recipe title in the requested language, or English if no language specified>

Ingredients:
- <List each ingredient in the requested language, or English if no language specified>

Instructions:
1. <Provide step-by-step instructions in the requested language, or English if no language specified>

Ensure all parts of the recipe (title, ingredients, instructions) are consistently in the requested language.
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
