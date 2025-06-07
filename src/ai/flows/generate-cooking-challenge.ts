
'use server';
/**
 * @fileOverview Generates a weekly cooking challenge.
 *
 * - generateCookingChallenge - A function that generates a cooking challenge.
 * - GenerateCookingChallengeInput - The input type for the generateCookingChallenge function (currently empty).
 * - GenerateCookingChallengeOutput - The return type for the generateCookingChallenge function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCookingChallengeInputSchema = z.object({}).describe("Input for generating a cooking challenge. Currently no specific inputs are needed, the challenge is random.");
export type GenerateCookingChallengeInput = z.infer<typeof GenerateCookingChallengeInputSchema>;

const GenerateCookingChallengeOutputSchema = z.object({
  title: z.string().describe("A catchy and descriptive title for the cooking challenge (e.g., 'The 3-Ingredient Dessert Dare', 'Global Spice Journey: Peru')."),
  description: z.string().describe("A detailed and engaging description of the challenge, explaining the goal, theme, and any creative prompts or background for the challenge."),
  constraints: z.array(z.string()).describe("A list of 2-4 specific, actionable rules or limitations for the challenge (e.g., 'Must use only 3 main ingredients (excluding pantry staples like oil, salt, pepper, basic flour/sugar unless they are key to the dish)', 'Dish must be inspired by Peruvian cuisine', 'Must be a no-bake recipe')."),
  exampleDish: z.string().optional().describe("An optional example of a dish that would fit the challenge, to inspire users (e.g., 'Mango Sticky Rice Parfait', 'Aji de Gallina Tacos').")
});
export type GenerateCookingChallengeOutput = z.infer<typeof GenerateCookingChallengeOutputSchema>;

export async function generateCookingChallenge(input?: GenerateCookingChallengeInput): Promise<GenerateCookingChallengeOutput> {
  // Ensure input is at least an empty object if undefined
  return generateCookingChallengeFlow(input || {});
}

const prompt = ai.definePrompt({
  name: 'generateCookingChallengePrompt',
  input: {schema: GenerateCookingChallengeInputSchema},
  output: {schema: GenerateCookingChallengeOutputSchema},
  prompt: `You are an AI that generates exciting weekly cooking challenges for a community of home cooks.
Your goal is to inspire creativity, learning, and fun in the kitchen.
Each challenge should be unique and interesting.

Consider themes like:
- Ingredient limitations (e.g., 3-ingredient meals, single-color dishes, one specific seasonal ingredient)
- Technique focus (e.g., mastering a specific sauce, fermentation, sous-vide cooking, creative plating)
- Cuisine exploration (e.g., cook a dish from a specific region you've never tried, fuse two cuisines)
- Pantry raids (e.g., make a meal using only what's currently in your pantry, no shopping allowed)
- Creative twists on classics (e.g., deconstruct a lasagna, savory cupcakes)
- Time-based challenges (e.g., a dish ready in under 20 minutes)
- Diet-specific challenges (e.g., create a gourmet vegan main course)

The output must be a challenge title, a detailed description, a list of 2-4 clear and concise constraints, and an optional example dish.
Ensure the challenges are generally achievable by an average home cook with standard kitchen equipment.
The tone should be enthusiastic and encouraging.
Generate a new, distinct challenge idea each time.
`,
});

const generateCookingChallengeFlow = ai.defineFlow(
  {
    name: 'generateCookingChallengeFlow',
    inputSchema: GenerateCookingChallengeInputSchema,
    outputSchema: GenerateCookingChallengeOutputSchema,
  },
  async (input) => {
    // Using a capable model for creative generation
    const {output} = await prompt(input, {model: 'googleai/gemini-2.0-flash'}); 
    return output!;
  }
);

