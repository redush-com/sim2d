import { separation, alignment, cohesion } from './behaviors';
import type { BoidAgent } from './types';

function makeBoid(overrides: Partial<BoidAgent> = {}): BoidAgent {
	return {
		id: 0,
		position: { x: 0, y: 0 },
		velocity: { x: 0, y: 0 },
		trail: [],
		...overrides,
	};
}

describe('separation', () => {
	it('returns zero vector for empty neighbors', () => {
		const agent = makeBoid();
		const result = separation(agent, []);
		expect(result.x).toBe(0);
		expect(result.y).toBe(0);
	});

	it('pushes away from a close neighbor', () => {
		const agent = makeBoid({ position: { x: 0, y: 0 } });
		const neighbor = makeBoid({ id: 1, position: { x: 1, y: 0 } });
		const result = separation(agent, [neighbor]);

		// Agent at origin, neighbor to the right => push left (negative x)
		expect(result.x).toBeLessThan(0);
		expect(result.y).toBeCloseTo(0, 5);
	});

	it('pushes harder for closer neighbors', () => {
		const agent = makeBoid({ position: { x: 0, y: 0 } });
		const closeNeighbor = makeBoid({ id: 1, position: { x: 1, y: 0 } });
		const farNeighbor = makeBoid({ id: 2, position: { x: 5, y: 0 } });

		const closeResult = separation(agent, [closeNeighbor]);
		const farResult = separation(agent, [farNeighbor]);

		expect(Math.abs(closeResult.x)).toBeGreaterThan(Math.abs(farResult.x));
	});

	it('averages forces from multiple neighbors', () => {
		const agent = makeBoid({ position: { x: 0, y: 0 } });
		// Neighbors on opposite sides should partially cancel out
		const left = makeBoid({ id: 1, position: { x: -2, y: 0 } });
		const right = makeBoid({ id: 2, position: { x: 2, y: 0 } });
		const result = separation(agent, [left, right]);

		expect(result.x).toBeCloseTo(0, 5);
		expect(result.y).toBeCloseTo(0, 5);
	});
});

describe('alignment', () => {
	it('returns zero vector for empty neighbors', () => {
		const agent = makeBoid();
		const result = alignment(agent, []);
		expect(result.x).toBe(0);
		expect(result.y).toBe(0);
	});

	it('matches average velocity of neighbors', () => {
		const agent = makeBoid({ velocity: { x: 0, y: 0 } });
		const n1 = makeBoid({ id: 1, velocity: { x: 4, y: 2 } });
		const n2 = makeBoid({ id: 2, velocity: { x: 6, y: 4 } });

		const result = alignment(agent, [n1, n2]);
		// Average velocity is (5, 3), agent velocity is (0, 0), so result = (5, 3)
		expect(result.x).toBeCloseTo(5, 5);
		expect(result.y).toBeCloseTo(3, 5);
	});

	it('returns difference between average neighbor velocity and agent velocity', () => {
		const agent = makeBoid({ velocity: { x: 2, y: 1 } });
		const neighbor = makeBoid({ id: 1, velocity: { x: 6, y: 3 } });

		const result = alignment(agent, [neighbor]);
		// Average velocity is (6, 3), agent is (2, 1) => result = (4, 2)
		expect(result.x).toBeCloseTo(4, 5);
		expect(result.y).toBeCloseTo(2, 5);
	});
});

describe('cohesion', () => {
	it('returns zero vector for empty neighbors', () => {
		const agent = makeBoid();
		const result = cohesion(agent, []);
		expect(result.x).toBe(0);
		expect(result.y).toBe(0);
	});

	it('steers toward center of mass of neighbors', () => {
		const agent = makeBoid({ position: { x: 0, y: 0 } });
		const n1 = makeBoid({ id: 1, position: { x: 4, y: 2 } });
		const n2 = makeBoid({ id: 2, position: { x: 6, y: 4 } });

		const result = cohesion(agent, [n1, n2]);
		// Center of mass is (5, 3), agent at origin => result = (5, 3)
		expect(result.x).toBeCloseTo(5, 5);
		expect(result.y).toBeCloseTo(3, 5);
	});

	it('returns zero when agent is already at center of mass', () => {
		const agent = makeBoid({ position: { x: 3, y: 3 } });
		const n1 = makeBoid({ id: 1, position: { x: 1, y: 1 } });
		const n2 = makeBoid({ id: 2, position: { x: 5, y: 5 } });

		const result = cohesion(agent, [n1, n2]);
		expect(result.x).toBeCloseTo(0, 5);
		expect(result.y).toBeCloseTo(0, 5);
	});
});
