
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "------------------------------------------------------------------------------------------"
  );
  console.error(
    "CRITICAL ERROR: Supabase URL or Anon Key is missing from environment variables."
  );
  console.error(
    "Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correctly set in your .env.local file."
  );
  console.error(
    "After creating or updating .env.local, YOU MUST RESTART your Next.js development server."
  );
  console.error(
    "Supabase client is being initialized with DUMMY values. API calls WILL FAIL."
  );
  console.error(
    "------------------------------------------------------------------------------------------"
  );

  // Initialize with placeholder/dummy values to prevent app crash on import
  // THIS IS NOT FOR PRODUCTION AND WILL NOT WORK FOR ACTUAL AUTH OR DATA OPERATIONS
  supabaseInstance = createClient('https://dummy-url.supabase.co', 'dummy-anon-key', {
    auth: {
      persistSession: false, // Don't attempt to persist session with a dummy client
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  });
} else {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase: SupabaseClient = supabaseInstance;
