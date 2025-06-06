
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const genkitPlugins: any[] = [];
let genkitModel: string | undefined = undefined;

// Check for GOOGLE_API_KEY.
// Note: dotenv (used in src/ai/dev.ts) loads the .env file from the project root for server-side files like this.
// Next.js also automatically loads .env files.
if (process.env.GOOGLE_API_KEY) {
  try {
    const googleAiPluginInstance = googleAI(); // Call it first
    genkitPlugins.push(googleAiPluginInstance); // Only push if successful
    genkitModel = 'googleai/gemini-2.0-flash'; // Only set the model if the plugin is successfully added
  } catch (e: any) {
    console.error(
      "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    );
    console.error(
      "CRITICAL GENKIT ERROR: Failed to initialize Google AI plugin, even with GOOGLE_API_KEY present."
    );
    console.error("Error details:", e.message);
    console.error(
      "Genkit AI features (flows, prompts) WILL LIKELY FAIL, potentially causing server errors (500)."
    );
    console.error(
      "Ensure your GOOGLE_API_KEY is valid and has the necessary permissions (e.g., Vertex AI enabled)."
    );
    console.error(
      "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    );
    genkitModel = undefined; // Ensure model is not set if plugin init failed
  }
} else {
  console.warn(
    "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  );
  console.warn(
    "CRITICAL GENKIT WARNING: GOOGLE_API_KEY not found in environment variables."
  );
  console.warn(
    "Expected in a .env file at the project root (e.g., GOOGLE_API_KEY=your_key_here)."
  );
  console.warn(
    "Genkit AI features (flows, prompts) WILL LIKELY FAIL or be non-functional, potentially causing server errors (500)."
  );
  console.warn(
    "Please create or update the .env file with your GOOGLE_API_KEY and RESTART THE SERVER."
  );
  console.warn(
    "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  );
}

export const ai = genkit({
  plugins: genkitPlugins,
  // Conditionally add the model property only if genkitModel is set.
  // If genkitModel is undefined (e.g. API key missing or plugin failed),
  // this avoids passing 'model: undefined' which might be problematic.
  ...(genkitModel ? { model: genkitModel } : {}),
});

