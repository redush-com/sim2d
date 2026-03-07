import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const SUPABASE_PUBLISHABLE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || '';

/**
 * Returns true if Supabase is configured with valid credentials.
 * @returns whether the Supabase client has a URL and key configured
 */
export function isSupabaseConfigured(): boolean {
	return SUPABASE_URL.length > 0 && SUPABASE_PUBLISHABLE_KEY.length > 0;
}

/**
 * Singleton Supabase client for auth and database operations.
 * Configured via VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY env vars.
 * When env vars are missing (e.g. CI), a placeholder client is created with a
 * dummy URL so the app can still render (auth features will be disabled).
 */
export const supabase: SupabaseClient = isSupabaseConfigured()
	? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
	: createClient('https://placeholder.supabase.co', 'placeholder');
