// Unit tests for src/simulations/pso/fitness.ts — benchmark fitness functions

import {
	rastrigin,
	rosenbrock,
	ackley,
	sphere,
	getFitnessFunction,
	FITNESS_FUNCTIONS,
} from './fitness';

describe('rastrigin', () => {
	it('returns 0 at the global minimum (0, 0)', () => {
		expect(rastrigin(0, 0)).toBe(0);
	});

	it('returns a positive value for non-zero inputs', () => {
		expect(rastrigin(1, 0)).toBeGreaterThan(0);
		expect(rastrigin(0, 1)).toBeGreaterThan(0);
		expect(rastrigin(0.5, -0.5)).toBeGreaterThan(0);
	});

	it('is symmetric: f(x,y) === f(-x,-y)', () => {
		expect(rastrigin(1, 2)).toBeCloseTo(rastrigin(-1, -2), 10);
	});
});

describe('rosenbrock', () => {
	it('returns 0 at the global minimum (1, 1)', () => {
		expect(rosenbrock(1, 1)).toBe(0);
	});

	it('returns a positive value away from (1, 1)', () => {
		expect(rosenbrock(0, 0)).toBeGreaterThan(0);
		expect(rosenbrock(2, 2)).toBeGreaterThan(0);
		expect(rosenbrock(-1, -1)).toBeGreaterThan(0);
	});

	it('returns the known value at (0, 0): (1-0)^2 + 100*(0-0)^2 = 1', () => {
		expect(rosenbrock(0, 0)).toBe(1);
	});
});

describe('ackley', () => {
	it('returns approximately 0 at the global minimum (0, 0)', () => {
		expect(ackley(0, 0)).toBeCloseTo(0, 10);
	});

	it('returns a positive value for non-zero inputs', () => {
		expect(ackley(1, 1)).toBeGreaterThan(0);
		expect(ackley(-0.5, 0.3)).toBeGreaterThan(0);
	});

	it('is symmetric: f(x,y) === f(-x,-y)', () => {
		expect(ackley(1, 2)).toBeCloseTo(ackley(-1, -2), 10);
	});
});

describe('sphere', () => {
	it('returns 0 at the global minimum (0, 0)', () => {
		expect(sphere(0, 0)).toBe(0);
	});

	it('computes x^2 + y^2', () => {
		expect(sphere(3, 4)).toBe(25);
		expect(sphere(1, 1)).toBe(2);
		expect(sphere(-2, 3)).toBe(13);
	});

	it('is symmetric: f(x,y) === f(-x,-y)', () => {
		expect(sphere(2, 5)).toBe(sphere(-2, -5));
	});
});

describe('getFitnessFunction', () => {
	it('returns rastrigin for index 0', () => {
		expect(getFitnessFunction(0)).toBe(rastrigin);
	});

	it('returns rosenbrock for index 1', () => {
		expect(getFitnessFunction(1)).toBe(rosenbrock);
	});

	it('returns ackley for index 2', () => {
		expect(getFitnessFunction(2)).toBe(ackley);
	});

	it('returns sphere for index 3', () => {
		expect(getFitnessFunction(3)).toBe(sphere);
	});

	it('clamps negative index to 0 (rastrigin)', () => {
		expect(getFitnessFunction(-1)).toBe(rastrigin);
		expect(getFitnessFunction(-100)).toBe(rastrigin);
	});

	it('clamps out-of-range index to the last function (sphere)', () => {
		const last = FITNESS_FUNCTIONS[FITNESS_FUNCTIONS.length - 1];
		expect(getFitnessFunction(99)).toBe(last);
		expect(getFitnessFunction(4)).toBe(last);
	});
});
