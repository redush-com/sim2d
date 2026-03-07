import { supabase, isSupabaseConfigured } from '../auth/supabase-client';

/** Row shape for the profiles table */
export interface Profile {
	id: string;
	display_name: string;
	avatar_url: string | null;
	created_at: string;
}

/**
 * Fetches the profile for the current authenticated user.
 * @param userId - the user's auth id
 * @returns the user profile, or null on error
 */
export async function getProfile(userId: string): Promise<Profile | null> {
	if (!isSupabaseConfigured()) return null;

	const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

	if (error) return null;
	return data as Profile;
}

/**
 * Updates the display name for the current user.
 * @param userId - the user's auth id
 * @param displayName - new display name
 * @returns true if successful
 */
export async function updateDisplayName(userId: string, displayName: string): Promise<boolean> {
	if (!isSupabaseConfigured()) return false;

	const { error } = await supabase
		.from('profiles')
		.update({ display_name: displayName })
		.eq('id', userId);

	return !error;
}
