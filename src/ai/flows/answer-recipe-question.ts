'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering user questions about recipes.
 *
 * - answerRecipeQuestion - An async function that takes a recipe and a question and returns an answer.
 * - AnswerRecipeQuestionInput - The input type for the answerRecipeQuestion function.
 * - AnswerRecipeQuestionOutput - The output type for the answerRecipeQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerRecipeQuestionInputSchema = z.object({
  recipe: z
    .string()
    .describe('The recipe to answer questions about, including ingredients and instructions.'),
  question: z.string().describe('The question to answer about the recipe.'),
});
export type AnswerRecipeQuestionInput = z.infer<typeof AnswerRecipeQuestionInputSchema>;

const AnswerRecipeQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question about the recipe.'),
});
export type AnswerRecipeQuestionOutput = z.infer<typeof AnswerRecipeQuestionOutputSchema>;

export async function answerRecipeQuestion(input: AnswerRecipeQuestionInput): Promise<AnswerRecipeQuestionOutput> {
  return answerRecipeQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerRecipeQuestionPrompt',
  input: {schema: AnswerRecipeQuestionInputSchema},
  output: {schema: AnswerRecipeQuestionOutputSchema},
  prompt: `You are a helpful AI assistant that answers questions about recipes.

  Here is the recipe:
  {{recipe}}

  Here is the question:
  {{question}}

  Please provide a concise and helpful answer.
  `,
});

const answerRecipeQuestionFlow = ai.defineFlow(
  {
    name: 'answerRecipeQuestionFlow',
    inputSchema: AnswerRecipeQuestionInputSchema,
    outputSchema: AnswerRecipeQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
