import { createSimulation, tick, updateParams, resetAgents } from './simulation';
import type { BoidParams } from './types';
import { DEFAULT_PARAMS } from './config';

/** Shared test dimensions */
const WIDTH = 800;
const HEIGHT = 600;

function makeParams(overrides: Partial<BoidParams> = {}): BoidParams {
	return { ...DEFAULT_PARAMS, ...overrides };
}

describe('createSimulation', () => {
	it('creates the correct number of agents', () => {
		const params = makeParams({ agentCount: 10 });
		const state = createSimulation(params, WIDTH, HEIGHT);
		expect(state.agents).toHaveLength(10);
	});

	it('places all agents within bounds', () => {
		const params = makeParams({ agentCount: 50 });
		const state = createSimulation(params, WIDTH, HEIGHT);

		for (const agent of state.agents) {
			expect(agent.position.x).toBeGreaterThanOrEqual(0);
			expect(agent.position.x).toBeLessThanOrEqual(WIDTH);
			expect(agent.position.y).toBeGreaterThanOrEqual(0);
			expect(agent.position.y).toBeLessThanOrEqual(HEIGHT);
		}
	});

	it('stores width, height, and params in state', () => {
		const params = makeParams({ agentCount: 5 });
		const state = createSimulation(params, WIDTH, HEIGHT);

		expect(state.width).toBe(WIDTH);
		expect(state.height).toBe(HEIGHT);
		expect(state.params).toEqual(params);
	});
});

describe('findNeighbors (tested indirectly via tick)', () => {
	it('finds agents within perception radius during tick', () => {
		// Two agents close together should influence each other
		const params = makeParams({ agentCount: 2, perceptionRadius: 100 });
		const state = createSimulation(params, WIDTH, HEIGHT);

		// Place agents close together
		state.agents[0].position = { x: 50, y: 50 };
		state.agents[1].position = { x: 60, y: 50 };
		state.agents[0].velocity = { x: 1, y: 0 };
		state.agents[1].velocity = { x: 1, y: 0 };

		// Tick should work without error — agents are neighbors
		const next = tick(state, 0.016);
		expect(next.agents).toHaveLength(2);
	});

	it('distant agents do not affect each other noticeably', () => {
		const params = makeParams({
			agentCount: 2,
			perceptionRadius: 10,
			separationWeight: 0,
			alignmentWeight: 0,
			cohesionWeight: 1,
		});
		const state = createSimulation(params, WIDTH, HEIGHT);

		// Place agents far apart — beyond perception radius
		state.agents[0].position = { x: 50, y: 50 };
		state.agents[1].position = { x: 500, y: 500 };
		state.agents[0].velocity = { x: 1, y: 0 };
		state.agents[1].velocity = { x: -1, y: 0 };

		const next = tick(state, 0.016);

		// Agent 0 should move roughly in its original velocity direction (no cohesion pull)
		expect(next.agents[0].position.x).toBeGreaterThan(50);
	});
});

describe('wrapPosition (tested indirectly via tick)', () => {
	it('wraps agent exiting the right edge to the left', () => {
		const params = makeParams({ agentCount: 1, maxSpeed: 1000, maxForce: 0 });
		const state = createSimulation(params, WIDTH, HEIGHT);

		state.agents[0].position = { x: WIDTH - 1, y: 300 };
		state.agents[0].velocity = { x: 500, y: 0 };

		const next = tick(state, 0.016);
		// With high velocity moving right, should wrap to left side
		expect(next.agents[0].position.x).toBeLessThan(WIDTH);
	});

	it('wraps agent exiting the bottom edge to the top', () => {
		const params = makeParams({ agentCount: 1, maxSpeed: 1000, maxForce: 0 });
		const state = createSimulation(params, WIDTH, HEIGHT);

		state.agents[0].position = { x: 400, y: HEIGHT - 1 };
		state.agents[0].velocity = { x: 0, y: 500 };

		const next = tick(state, 0.016);
		expect(next.agents[0].position.y).toBeLessThan(HEIGHT);
	});

	it('wraps agent exiting the left edge to the right', () => {
		const params = makeParams({ agentCount: 1, maxSpeed: 1000, maxForce: 0 });
		const state = createSimulation(params, WIDTH, HEIGHT);

		state.agents[0].position = { x: 1, y: 300 };
		state.agents[0].velocity = { x: -500, y: 0 };

		const next = tick(state, 0.016);
		expect(next.agents[0].position.x).toBeGreaterThan(0);
	});

	it('wraps agent exiting the top edge to the bottom', () => {
		const params = makeParams({ agentCount: 1, maxSpeed: 1000, maxForce: 0 });
		const state = createSimulation(params, WIDTH, HEIGHT);

		state.agents[0].position = { x: 400, y: 1 };
		state.agents[0].velocity = { x: 0, y: -500 };

		const next = tick(state, 0.016);
		expect(next.agents[0].position.y).toBeGreaterThan(0);
	});
});

describe('tick', () => {
	it('moves agents from their original positions', () => {
		const params = makeParams({ agentCount: 5 });
		const state = createSimulation(params, WIDTH, HEIGHT);
		const originalPositions = state.agents.map((a) => ({ ...a.position }));

		const next = tick(state, 0.016);

		// At least some agents should have moved
		const moved = next.agents.some(
			(a, i) => a.position.x !== originalPositions[i].x || a.position.y !== originalPositions[i].y,
		);
		expect(moved).toBe(true);
	});

	it('returns a new state object', () => {
		const params = makeParams({ agentCount: 3 });
		const state = createSimulation(params, WIDTH, HEIGHT);
		const next = tick(state, 0.016);

		expect(next).not.toBe(state);
		expect(next.agents).not.toBe(state.agents);
	});
});

describe('updateParams', () => {
	it('re-creates agents when agent count changes', () => {
		const params = makeParams({ agentCount: 10 });
		const state = createSimulation(params, WIDTH, HEIGHT);
		const newParams = makeParams({ agentCount: 20 });
		const next = updateParams(state, newParams);

		expect(next.agents).toHaveLength(20);
		expect(next.params.agentCount).toBe(20);
	});

	it('keeps existing agents when count stays the same', () => {
		const params = makeParams({ agentCount: 10 });
		const state = createSimulation(params, WIDTH, HEIGHT);

		const newParams = makeParams({ agentCount: 10, maxSpeed: 999 });
		const next = updateParams(state, newParams);

		// Same agents array reference positions should be preserved
		expect(next.agents).toHaveLength(10);
		expect(next.params.maxSpeed).toBe(999);
		expect(next.agents[0].position).toEqual(state.agents[0].position);
	});
});

describe('resetAgents', () => {
	it('returns a state with the same number of agents', () => {
		const params = makeParams({ agentCount: 15 });
		const state = createSimulation(params, WIDTH, HEIGHT);
		const next = resetAgents(state);

		expect(next.agents).toHaveLength(15);
	});

	it('gives agents new positions', () => {
		const params = makeParams({ agentCount: 20 });
		const state = createSimulation(params, WIDTH, HEIGHT);
		const originalPositions = state.agents.map((a) => ({ ...a.position }));

		const next = resetAgents(state);

		// With 20 agents, it is extremely unlikely all would get the exact same positions
		const allSame = next.agents.every(
			(a, i) => a.position.x === originalPositions[i].x && a.position.y === originalPositions[i].y,
		);
		expect(allSame).toBe(false);
	});

	it('preserves params', () => {
		const params = makeParams({ agentCount: 5, maxSpeed: 123 });
		const state = createSimulation(params, WIDTH, HEIGHT);
		const next = resetAgents(state);

		expect(next.params).toEqual(params);
	});
});
