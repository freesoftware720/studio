
'use server';
/**
 * @fileOverview Detects ingredients from an image using AI.
 *
 * - detectIngredientsFromImage - A function that takes an image data URI and returns a list of detected ingredients.
 * - DetectIngredientsInput - The input type for the detectIngredientsFromImage function.
 * - DetectIngredientsOutput - The return type for the detectIngredientsFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectIngredientsInputSchema = z.object({
    photoDataUri: z
        .string()
        .describe(
            "A photo of food items (e.g., inside a fridge or pantry), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
});
export type DetectIngredientsInput = z.infer<typeof DetectIngredientsInputSchema>;

const DetectIngredientsOutputSchema = z.object({
    detectedIngredients: z
        .array(z.string())
        .describe('A list of food ingredients identified in the image.'),
});
export type DetectIngredientsOutput = z.infer<typeof DetectIngredientsOutputSchema>;

export async function detectIngredientsFromImage(
    input: DetectIngredientsInput
): Promise<DetectIngredientsOutput> {
    return detectIngredientsFlow(input);
}

const prompt = ai.definePrompt({
    name: 'detectIngredientsPrompt',
    input: { schema: DetectIngredientsInputSchema },
    output: { schema: DetectIngredientsOutputSchema },
    prompt: `You are an expert at identifying food ingredients from images.
Analyze the provided image and list all visible food ingredients.
Focus on common cooking ingredients. If multiple items of the same ingredient are visible, list it once.
Be concise in your naming (e.g., "onion" instead of "a large red onion").
If no food ingredients are clearly identifiable, return an empty list for detectedIngredients.

Image: {{media url=photoDataUri}}`,
});

const detectIngredientsFlow = ai.defineFlow(
    {
        name: 'detectIngredientsFlow',
        inputSchema: DetectIngredientsInputSchema,
        outputSchema: DetectIngredientsOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input, { model: 'googleai/gemini-pro-vision' });
        // Ensure that if output is null or undefined, we still return the correct schema shape.
        return output || { detectedIngredients: [] };
    }
);
