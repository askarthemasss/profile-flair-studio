export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ?? "",
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
  RENDER_API_URL: import.meta.env.VITE_RENDER_API_URL ?? "https://sigil.dev",
} as const;
