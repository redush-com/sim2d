import { createAgent, updateAgent } from './agent';
import type { ApfParams } from './types';

function makeParams(overrides: Partial<ApfParams> = {}): ApfParams {
	return {
		kAtt: 1,
		kRep: 1,
		kRepRobot: 1,
		d0: 50,
		dRobot: 30,
		agentCount: 5,
		maxSpeed: 100,
		trailLength: 20,
		perturbStrength: 0.1,
		stuckThreshold: 0.5,
		stuckFrames: 30,
		...overrides,
	};
}

describe('createAgent', () => {
	it('sets correct id and position', () => {
		const agent = createAgent(7, { x: 10, y: 20 });

		expect(agent.id).toBe(7);
		expect(agent.position.x).toBe(10);
		expect(agent.position.y).toBe(20);
	});

	it('initializes with zero velocity', () => {
		const agent = createAgent(0, { x: 50, y: 50 });

		expect(agent.velocity.x).toBe(0);
		expect(agent.velocity.y).toBe(0);
	});

	it('initializes trail with the starting position', () => {
		const pos = { x: 30, y: 40 };
		const agent = createAgent(0, pos);

		expect(agent.trail).toHaveLength(1);
		expect(agent.trail[0]).toEqual(pos);
	});

	it('initializes stuckCounter to zero', () => {
		const agent = createAgent(0, { x: 0, y: 0 });
		expect(agent.stuckCounter).toBe(0);
	});
});

describe('updateAgent', () => {
	it('moves agent in the direction of force', () => {
		const agent = createAgent(0, { x: 100, y: 100 });
		const params = makeParams({ maxSpeed: 100 });

		// Apply a force pointing right
		const updated = updateAgent(agent, { x: 10, y: 0 }, 0.1, params);

		expect(updated.position.x).toBeGreaterThan(100);
		expect(updated.position.y).toBeCloseTo(100, 1);
	});

	it('applies velocity smoothing (does not instantly reach desired velocity)', () => {
		const agent = createAgent(0, { x: 0, y: 0 });
		const params = makeParams({ maxSpeed: 100 });

		// Apply a strong force — due to smoothing factor 0.85, velocity should be
		// only 15% of desired on the first step
		const updated = updateAgent(agent, { x: 100, y: 0 }, 1, params);

		// Desired speed would be maxSpeed=100, but with 0.85 smoothing from zero,
		// actual velocity should be about 15 (0.15 * 100)
		expect(updated.velocity.x).toBeCloseTo(15, 0);
		expect(updated.velocity.x).toBeLessThan(100);
	});

	it('grows the trail with each update', () => {
		const agent = createAgent(0, { x: 0, y: 0 });
		const params = makeParams({ trailLength: 10 });

		const updated = updateAgent(agent, { x: 1, y: 0 }, 0.1, params);

		expect(updated.trail.length).toBe(2);
	});

	it('trims trail to trailLength limit', () => {
		let agent = createAgent(0, { x: 0, y: 0 });
		const params = makeParams({ trailLength: 3, maxSpeed: 100 });

		// Update multiple times to exceed trail length
		for (let i = 0; i < 5; i++) {
			agent = updateAgent(agent, { x: 1, y: 0 }, 0.1, params);
		}

		expect(agent.trail.length).toBeLessThanOrEqual(3);
	});

	it('does not move when force is near zero', () => {
		const agent = createAgent(0, { x: 50, y: 50 });
		const params = makeParams();

		const updated = updateAgent(agent, { x: 0, y: 0 }, 0.1, params);

		expect(updated.position.x).toBeCloseTo(50, 1);
		expect(updated.position.y).toBeCloseTo(50, 1);
	});
});
