import { createClient } from "@supabase/supabase-js";

// These are set via Vercel / .env — fallback to known project values for local dev
const FALLBACK_URL = "https://wialpeheyvjdsmfcwuvn.supabase.co";
const FALLBACK_KEY = "sb_publishable_FFqIxdyUYZ-PyPdFJaQnOQ_nQNzubG-";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;

// Helper to determine if actual credentials are set
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY_HERE" &&
  supabaseAnonKey !== "[provided separately]"
);

if (import.meta.env.DEV) {
  if (!import.meta.env.VITE_SUPABASE_URL) {
    console.warn("[Supabase] VITE_SUPABASE_URL not set — using fallback project URL.");
  }
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn("[Supabase] VITE_SUPABASE_ANON_KEY not set — using fallback anon key.");
  }
}

// Single reusable client — never throws on initialization
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

