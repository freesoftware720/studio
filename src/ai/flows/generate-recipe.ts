
'use server';

/**
 * @fileOverview Generates a recipe based on user-provided ingredients and dietary preferences.
 * Can also operate in a "Surprise Me" mode for more creative recipes, and consider max cooking time.
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
  surpriseMe: z
    .boolean()
    .optional()
    .describe('If true, instructs the AI to be more creative and less constrained by cuisine/mealType for an unexpected recipe.'),
  maxCookingTimeMinutes: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('The maximum estimated cooking time in minutes for the recipe. The AI should try to generate a recipe that fits within this time.'),
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
  prompt: `
{{#if surpriseMe}}
You are a highly creative and adventurous recipe generation AI. This is a 'Surprise Me' request!
Your goal is to generate a unique and delightful recipe using the provided ingredients: {{{ingredients}}}.
{{#if cuisine}}You can take inspiration from {{cuisine}} cuisine, but feel free to deviate wildly for a surprising twist!{{/if}}
{{#if mealType}}The user suggested {{mealType}} as a meal type, but you can interpret this loosely or suggest an alternative if a more creative idea strikes you.{{/if}}
{{#if dietaryRestrictions}}Strictly adhere to these dietary restrictions: {{{dietaryRestrictions}}}.{{/if}}
{{#if maxCookingTimeMinutes}}The recipe should be completable within approximately {{maxCookingTimeMinutes}} minutes.{{/if}}
Prioritize an exciting, unexpected, yet delicious outcome.
{{#if language}}Generate the entire recipe (title, ingredients list, and instructions) in the specified language: {{language}}.{{else}}Generate the recipe in English.{{/if}}

{{else}}
You are a recipe generation AI.
{{#if language}}
IMPORTANT: Generate the entire recipe (title, ingredients list, and instructions) in the specified language: {{language}}.
{{else}}
Generate the recipe in English.
{{/if}}

Based on the following details:

Ingredients: {{{ingredients}}}

{{#if cuisine}}
Cuisine: {{{cuisine}}}
IMPORTANT: Please generate an authentic recipe representative of {{cuisine}} cuisine. Aim for traditional flavors and techniques where appropriate.
{{/if}}

{{#if mealType}}
Meal Type: {{{mealType}}}
{{/if}}

{{#if dietaryRestrictions}}
Dietary Restrictions: {{{dietaryRestrictions}}}
{{/if}}

{{#if maxCookingTimeMinutes}}
Maximum Cooking Time: Please generate a recipe that can reasonably be prepared and cooked within {{maxCookingTimeMinutes}} minutes. This is an estimate, but the recipe steps should reflect this time constraint.
{{/if}}
{{/if}}

Format the output as follows:

Recipe Title: <The recipe title in the requested language, or English if no language specified>

Ingredients:
- <List each ingredient in the requested language, or English if no language specified>

Instructions:
1. <Provide step-by-step instructions in the requested language, or English if no language specified>

Ensure all parts of the recipe (title, ingredients, instructions) are consistently in the requested language.
If a maximum cooking time was specified, ensure the recipe is appropriate for that duration.
`,
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input, {model: 'googleai/gemini-2.0-flash'});
    return output!;
  }
);

