import { supabase, isSupabaseConfigured } from '../auth/supabase-client';
import type { SavedSimulation } from './saved-simulations';

/** Row shape for the shared_links table */
export interface SharedLink {
	id: string;
	simulation_id: string;
	share_token: string;
	created_at: string;
	expires_at: string | null;
}

/**
 * Creates a share link for a saved simulation.
 * @param simulationId - the simulation to share
 * @returns the created shared link, or null on error
 */
export async function createShareLink(simulationId: string): Promise<SharedLink | null> {
	if (!isSupabaseConfigured()) return null;

	const { data, error } = await supabase
		.from('shared_links')
		.insert({ simulation_id: simulationId })
		.select()
		.single();

	if (error) {
		console.error('Failed to create share link:', error);
		return null;
	}
	return data as SharedLink;
}

/**
 * Resolves a share token to the associated simulation data.
 * @param token - the share token from the URL
 * @returns the simulation data, or null if not found/expired
 */
export async function resolveShareToken(token: string): Promise<SavedSimulation | null> {
	if (!isSupabaseConfigured()) return null;

	const { data: link, error: linkError } = await supabase
		.from('shared_links')
		.select('simulation_id, expires_at')
		.eq('share_token', token)
		.single();

	if (linkError || !link) return null;

	// Check expiration
	if (link.expires_at && new Date(link.expires_at) < new Date()) return null;

	const { data: sim, error: simError } = await supabase
		.from('saved_simulations')
		.select('*')
		.eq('id', link.simulation_id)
		.single();

	if (simError || !sim) return null;
	return sim as SavedSimulation;
}

/**
 * Builds the full share URL for a given token.
 * @param token - the share token
 * @returns full URL with hash route
 */
export function buildShareUrl(token: string): string {
	return `${window.location.origin}/shared/${token}`;
}
