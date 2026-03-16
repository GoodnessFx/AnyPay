function optionalEnv(name: string): string {
  const value = (import.meta as any).env?.[name] as string | undefined;
  return (value ?? "").trim();
}

export const supabaseUrl = optionalEnv("VITE_SUPABASE_URL");
export const publicAnonKey = optionalEnv("VITE_SUPABASE_ANON_KEY");
export const isSupabaseConfigured = Boolean(supabaseUrl && publicAnonKey);

/**
 * Supabase Edge Functions path prefix.
 * Example: "make-server-ed0cf80c"
 */
export const functionsPrefix =
  ((import.meta as any).env?.VITE_SUPABASE_FUNCTIONS_PREFIX as string | undefined) ??
  "make-server-ed0cf80c";