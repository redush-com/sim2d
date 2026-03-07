import type { SimulationDefinition } from './types';

const SIMULATIONS: SimulationDefinition[] = [];

/**
 * Registers a simulation definition so it appears on the main menu.
 * Called by each simulation module on import.
 * @param definition - the simulation to register
 */
export function register(definition: SimulationDefinition): void {
  SIMULATIONS.push(definition);
}

/**
 * Returns all registered simulation definitions.
 * @returns array of all registered simulations
 */
export function getAll(): SimulationDefinition[] {
  return [...SIMULATIONS];
}

/**
 * Finds a simulation by its unique id.
 * @param id - simulation identifier
 * @returns the definition, or undefined if not found
 */
export function getById(id: string): SimulationDefinition | undefined {
  return SIMULATIONS.find((s) => s.id === id);
}
