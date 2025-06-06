
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  );
  console.error(
    "CRITICAL SUPABASE WARNING: Supabase URL or Anon Key is missing from environment variables."
  );
  console.error(
    "Expected NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local file."
  );
  console.error(
    "After creating or updating .env.local, YOU MUST RESTART your Next.js development server."
  );
  console.error(
    "Supabase client is being initialized with DUMMY values. API calls WILL FAIL or be non-functional."
  );
  console.error(
    "This can lead to authentication failures and data operations not working."
  );
  console.error(
    "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  );

  supabaseInstance = createClient('https://dummy-url.supabase.co', 'dummy-anon-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  });
} else {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase: SupabaseClient = supabaseInstance;
