
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const genkitPlugins: any[] = [];
let genkitModel: string | undefined = undefined;

// Check for GOOGLE_API_KEY.
// Note: dotenv (used in src/ai/dev.ts) loads the .env file from the project root for server-side files like this.
if (process.env.GOOGLE_API_KEY) {
  try {
    genkitPlugins.push(googleAI());
    genkitModel = 'googleai/gemini-2.0-flash'; // Only set the model if the plugin is successfully added
  } catch (e: any) {
    console.error(
      "------------------------------------------------------------------------------------------"
    );
    console.error(
      "ERROR: Failed to initialize Google AI plugin for Genkit, even with GOOGLE_API_KEY present."
    );
    console.error("Error details:", e.message);
    console.error(
      "Genkit AI features may not work correctly. Ensure your GOOGLE_API_KEY is valid and has the necessary permissions."
    );
    console.error(
      "------------------------------------------------------------------------------------------"
    );
    // Keep genkitModel as undefined and plugins array might contain a partially failed plugin or be empty.
    // This will likely lead to runtime errors when AI features are used, but aims to prevent server startup crash.
    genkitModel = undefined; // Ensure model is not set if plugin init failed
  }
} else {
  console.warn(
    "------------------------------------------------------------------------------------------"
  );
  console.warn(
    "WARNING: GOOGLE_API_KEY not found in environment variables (expected in .env file at project root)."
  );
  console.warn(
    "Genkit AI features will be disabled or may not work correctly."
  );
  console.warn(
    "Please create or update the .env file at the root of your project with your GOOGLE_API_KEY and restart the server."
  );
  console.warn(
    "Example .env file content: \nGOOGLE_API_KEY=your_actual_google_api_key_here"
  );
  console.warn(
    "------------------------------------------------------------------------------------------"
  );
}

export const ai = genkit({
  plugins: genkitPlugins,
  // Conditionally add the model property only if genkitModel is set.
  // If genkitModel is undefined (e.g. API key missing or plugin failed),
  // this avoids passing 'model: undefined' which might be problematic.
  ...(genkitModel ? { model: genkitModel } : {}),
});
