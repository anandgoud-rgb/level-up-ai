import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Kept null when env vars are missing so the form can show a clear message
// instead of crashing the whole page.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const supabaseReady = Boolean(url && anonKey);
