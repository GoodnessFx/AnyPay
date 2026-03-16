import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseUrl, publicAnonKey } from "./info";

// Create a singleton Supabase client to avoid multiple instances
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    if (!isSupabaseConfigured) {
      throw new Error(
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local."
      );
    }
    supabaseClient = createClient(supabaseUrl, publicAnonKey);
  }
  return supabaseClient;
}