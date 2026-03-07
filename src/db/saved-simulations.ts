import { supabase, isSupabaseConfigured } from '../auth/supabase-client';
import { authStore } from '../auth/auth-store';

/** Row shape for the saved_simulations table */
export interface SavedSimulation {
	id: string;
	user_id: string;
	title: string;
	description: string;
	sim_type: 'builtin' | 'custom';
	builtin_id: string | null;
	params: Record<string, number>;
	source_code: string | null;
	visibility: 'private' | 'public';
	created_at: string;
	updated_at: string;
}

/**
 * Fetches all saved simulations for the current user.
 * @returns array of saved simulations, or empty array on error
 */
export async function getUserSimulations(): Promise<SavedSimulation[]> {
	if (!isSupabaseConfigured()) return [];

	const { data, error } = await supabase
		.from('saved_simulations')
		.select('*')
		.order('updated_at', { ascending: false });

	if (error) {
		console.error('Failed to fetch simulations:', error);
		return [];
	}
	return data as SavedSimulation[];
}

/**
 * Saves a new simulation configuration to the database.
 * @param sim - simulation data to save (without id and timestamps)
 * @returns the created row, or null on error
 */
export async function saveSimulation(sim: {
	title: string;
	description?: string;
	sim_type: 'builtin' | 'custom';
	builtin_id?: string;
	params?: Record<string, number>;
	source_code?: string;
}): Promise<SavedSimulation | null> {
	if (!isSupabaseConfigured()) return null;

	const user = authStore.getState().user;
	if (!user) return null;

	const { data, error } = await supabase
		.from('saved_simulations')
		.insert({
			user_id: user.id,
			title: sim.title,
			description: sim.description || '',
			sim_type: sim.sim_type,
			builtin_id: sim.builtin_id || null,
			params: sim.params || {},
			source_code: sim.source_code || null,
		})
		.select()
		.single();

	if (error) {
		console.error('Failed to save simulation:', error);
		return null;
	}
	return data as SavedSimulation;
}

/**
 * Deletes a saved simulation by id.
 * @param id - simulation id to delete
 * @returns true if successful
 */
export async function deleteSimulation(id: string): Promise<boolean> {
	if (!isSupabaseConfigured()) return false;

	const { error } = await supabase.from('saved_simulations').delete().eq('id', id);

	if (error) {
		console.error('Failed to delete simulation:', error);
		return false;
	}
	return true;
}

/**
 * Fetches a single simulation by id.
 * @param id - simulation id
 * @returns the simulation, or null if not found
 */
export async function getSimulationById(id: string): Promise<SavedSimulation | null> {
	if (!isSupabaseConfigured()) return null;

	const { data, error } = await supabase
		.from('saved_simulations')
		.select('*')
		.eq('id', id)
		.single();

	if (error) return null;
	return data as SavedSimulation;
}
