
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-recipe.ts';
import '@/ai/flows/answer-recipe-question.ts';
import '@/ai/flows/generate-recipe-image.ts';
import '@/ai/flows/detect-ingredients-from-image.ts';
import '@/ai/flows/analyze-recipe-nutrition.ts'; // New import
