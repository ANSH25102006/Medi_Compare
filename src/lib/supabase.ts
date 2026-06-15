import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Helper to determine if actual credentials are set
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY_HERE" &&
  supabaseAnonKey !== "[provided separately]"
);

// Single reusable client
export const supabase = createClient(
  supabaseUrl || "https://wialpeheyvjdsmfcwuvn.supabase.co",
  supabaseAnonKey || "dummy-key"
);
