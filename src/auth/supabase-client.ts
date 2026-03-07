import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string || '';

/**
 * Singleton Supabase client for auth and database operations.
 * Configured via VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars.
 */
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Returns true if Supabase is configured with valid credentials.
 * @returns whether the Supabase client has a URL configured
 */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
