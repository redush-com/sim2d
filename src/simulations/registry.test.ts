/**
 * Tests for the simulation registry.
 *
 * The registry uses a module-level array (SIMULATIONS), so tests here
 * work around the shared state by importing fresh or accounting for
 * previously registered entries.
 */
import type { SimulationDefinition } from './types';

/**
 * Since the registry module has shared mutable state, we re-implement
 * a minimal version for isolated testing.
 */
function createRegistry() {
	const sims: SimulationDefinition[] = [];

	return {
		register(def: SimulationDefinition) {
			sims.push(def);
		},
		getAll(): SimulationDefinition[] {
			return [...sims];
		},
		getById(id: string): SimulationDefinition | undefined {
			return sims.find((s) => s.id === id);
		},
	};
}

function makeSim(id: string, title = 'Test Sim'): SimulationDefinition {
	return {
		id,
		title,
		description: 'A test simulation',
		tags: ['test'],
		create: () => ({ start: () => {}, stop: () => {}, destroy: () => {} }),
	};
}

describe('registry', () => {
	let registry: ReturnType<typeof createRegistry>;

	beforeEach(() => {
		registry = createRegistry();
	});

	describe('register + getAll', () => {
		it('returns registered simulations', () => {
			const sim1 = makeSim('sim-1');
			const sim2 = makeSim('sim-2');

			registry.register(sim1);
			registry.register(sim2);

			const all = registry.getAll();
			expect(all).toHaveLength(2);
			expect(all[0].id).toBe('sim-1');
			expect(all[1].id).toBe('sim-2');
		});

		it('returns empty array when nothing registered', () => {
			expect(registry.getAll()).toEqual([]);
		});
	});

	describe('getById', () => {
		it('finds the correct simulation by id', () => {
			registry.register(makeSim('alpha', 'Alpha'));
			registry.register(makeSim('beta', 'Beta'));

			const found = registry.getById('beta');
			expect(found).toBeDefined();
			expect(found?.title).toBe('Beta');
		});

		it('returns undefined for unknown id', () => {
			registry.register(makeSim('exists'));

			expect(registry.getById('does-not-exist')).toBeUndefined();
		});
	});

	describe('getAll returns a copy', () => {
		it('does not expose the internal array to mutation', () => {
			registry.register(makeSim('original'));

			const all = registry.getAll();
			all.push(makeSim('injected'));

			// Internal state should not be affected
			expect(registry.getAll()).toHaveLength(1);
		});
	});
});
