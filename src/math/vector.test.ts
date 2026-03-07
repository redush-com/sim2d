// Unit tests for src/math/vector.ts — pure 2D vector math functions

import {
	create,
	add,
	sub,
	scale,
	magnitude,
	normalize,
	distance,
	clampMagnitude,
	randomUnit,
	ZERO,
} from './vector';

describe('create', () => {
	it('creates a vector with the given components', () => {
		const v = create(3, 7);
		expect(v).toEqual({ x: 3, y: 7 });
	});

	it('supports negative values', () => {
		const v = create(-1, -2);
		expect(v).toEqual({ x: -1, y: -2 });
	});

	it('supports zero', () => {
		const v = create(0, 0);
		expect(v).toEqual({ x: 0, y: 0 });
	});
});

describe('add', () => {
	it('adds two vectors component-wise', () => {
		expect(add({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 });
	});

	it('adding zero vector returns the original', () => {
		const v = { x: 5, y: -3 };
		expect(add(v, ZERO)).toEqual(v);
	});

	it('handles negative components', () => {
		expect(add({ x: -1, y: 2 }, { x: 1, y: -2 })).toEqual({ x: 0, y: 0 });
	});
});

describe('sub', () => {
	it('subtracts two vectors component-wise', () => {
		expect(sub({ x: 5, y: 10 }, { x: 3, y: 4 })).toEqual({ x: 2, y: 6 });
	});

	it('subtracting a vector from itself gives zero', () => {
		const v = { x: 7, y: -3 };
		expect(sub(v, v)).toEqual({ x: 0, y: 0 });
	});

	it('subtracting zero returns the original', () => {
		const v = { x: 5, y: -3 };
		expect(sub(v, ZERO)).toEqual(v);
	});
});

describe('scale', () => {
	it('scales a vector by a positive scalar', () => {
		expect(scale({ x: 2, y: 3 }, 4)).toEqual({ x: 8, y: 12 });
	});

	it('scales by zero to produce the zero vector', () => {
		expect(scale({ x: 99, y: -50 }, 0)).toEqual({ x: 0, y: -0 });
	});

	it('scales by a negative scalar to reverse direction', () => {
		expect(scale({ x: 1, y: -2 }, -3)).toEqual({ x: -3, y: 6 });
	});

	it('scales by 1 to return an equal vector', () => {
		expect(scale({ x: 5, y: 7 }, 1)).toEqual({ x: 5, y: 7 });
	});
});

describe('magnitude', () => {
	it('returns 5 for a 3-4-5 triangle', () => {
		expect(magnitude({ x: 3, y: 4 })).toBe(5);
	});

	it('returns 0 for the zero vector', () => {
		expect(magnitude(ZERO)).toBe(0);
	});

	it('returns correct value for a unit axis vector', () => {
		expect(magnitude({ x: 1, y: 0 })).toBe(1);
		expect(magnitude({ x: 0, y: 1 })).toBe(1);
	});

	it('returns sqrt(2) for (1,1)', () => {
		expect(magnitude({ x: 1, y: 1 })).toBeCloseTo(Math.SQRT2, 10);
	});
});

describe('normalize', () => {
	it('returns a unit vector in the same direction', () => {
		const n = normalize({ x: 3, y: 4 });
		expect(n.x).toBeCloseTo(0.6, 10);
		expect(n.y).toBeCloseTo(0.8, 10);
		expect(magnitude(n)).toBeCloseTo(1, 10);
	});

	it('returns zero vector for a zero-length input', () => {
		const n = normalize(ZERO);
		expect(n).toEqual({ x: 0, y: 0 });
	});

	it('returns zero vector for a near-zero input', () => {
		const n = normalize({ x: 1e-15, y: 1e-15 });
		expect(n).toEqual({ x: 0, y: 0 });
	});

	it('normalizes a negative vector correctly', () => {
		const n = normalize({ x: -3, y: -4 });
		expect(n.x).toBeCloseTo(-0.6, 10);
		expect(n.y).toBeCloseTo(-0.8, 10);
	});
});

describe('distance', () => {
	it('returns 5 for a 3-4-5 displacement', () => {
		expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
	});

	it('returns 0 for the same point', () => {
		const p = { x: 7, y: -2 };
		expect(distance(p, p)).toBe(0);
	});

	it('is symmetric', () => {
		const a = { x: 1, y: 2 };
		const b = { x: 4, y: 6 };
		expect(distance(a, b)).toBeCloseTo(distance(b, a), 10);
	});

	it('returns correct value for known offset', () => {
		expect(distance({ x: 1, y: 1 }, { x: 4, y: 5 })).toBe(5);
	});
});

describe('clampMagnitude', () => {
	it('returns the same vector when under the limit', () => {
		const v = { x: 1, y: 1 };
		const result = clampMagnitude(v, 10);
		expect(result).toBe(v); // same reference since mag <= max
	});

	it('clamps to the max magnitude when over the limit', () => {
		const v = { x: 30, y: 40 }; // magnitude 50
		const result = clampMagnitude(v, 5);
		expect(magnitude(result)).toBeCloseTo(5, 10);
		// direction should be preserved
		expect(result.x).toBeCloseTo(3, 10);
		expect(result.y).toBeCloseTo(4, 10);
	});

	it('returns zero vector unchanged when limit is positive', () => {
		const result = clampMagnitude(ZERO, 5);
		// zero vector has magnitude 0, which is <= max, so same ref returned
		expect(result).toBe(ZERO);
	});

	it('returns the same vector when magnitude equals the limit', () => {
		const v = { x: 3, y: 4 }; // magnitude 5
		const result = clampMagnitude(v, 5);
		expect(result).toBe(v);
	});
});

describe('randomUnit', () => {
	it('returns a vector with magnitude approximately 1', () => {
		for (let i = 0; i < 20; i++) {
			const v = randomUnit();
			expect(magnitude(v)).toBeCloseTo(1, 10);
		}
	});
});

describe('ZERO', () => {
	it('is (0, 0)', () => {
		expect(ZERO).toEqual({ x: 0, y: 0 });
	});
});
