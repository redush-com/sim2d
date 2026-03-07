// Unit tests for src/simulations/ant-colony/pheromones.ts — pheromone grid operations

import { createPheromoneGrid, evaporate, deposit, getPheromone } from './pheromones';

describe('createPheromoneGrid', () => {
	it('creates a grid of the correct size', () => {
		const grid = createPheromoneGrid(10, 5);
		expect(grid.length).toBe(50);
	});

	it('initializes all cells to zero', () => {
		const grid = createPheromoneGrid(4, 3);
		for (const cell of grid) {
			expect(cell).toBe(0);
		}
	});

	it('returns a Float32Array', () => {
		const grid = createPheromoneGrid(2, 2);
		expect(grid).toBeInstanceOf(Float32Array);
	});
});

describe('deposit', () => {
	it('increases the value at the correct position', () => {
		const cols = 5;
		const grid = createPheromoneGrid(cols, 5);
		deposit(grid, cols, 2, 3, 10, 1);
		// index = y * cols + x = 3 * 5 + 2 = 17
		expect(grid[17]).toBe(10);
	});

	it('accumulates with multiple deposits', () => {
		const cols = 5;
		const grid = createPheromoneGrid(cols, 5);
		deposit(grid, cols, 0, 0, 5, 1);
		deposit(grid, cols, 0, 0, 3, 1);
		expect(grid[0]).toBeCloseTo(8, 5);
	});

	it('applies inverse path length weighting', () => {
		const cols = 5;
		const grid = createPheromoneGrid(cols, 5);

		// strength=10, pathLength=2 -> amount = 10/2 = 5
		deposit(grid, cols, 1, 0, 10, 2);
		expect(grid[1]).toBeCloseTo(5, 5);

		// strength=10, pathLength=5 -> amount = 10/5 = 2
		const grid2 = createPheromoneGrid(cols, 5);
		deposit(grid2, cols, 1, 0, 10, 5);
		expect(grid2[1]).toBeCloseTo(2, 5);
	});

	it('clamps pathLength to at least 1 (avoids division by zero)', () => {
		const cols = 3;
		const grid = createPheromoneGrid(cols, 3);
		deposit(grid, cols, 0, 0, 10, 0);
		expect(grid[0]).toBeCloseTo(10, 5); // 10 / max(0,1) = 10
	});
});

describe('evaporate', () => {
	it('reduces all values by the evaporation rate', () => {
		const cols = 3;
		const grid = createPheromoneGrid(cols, 3);
		grid[0] = 10;
		grid[4] = 20;

		evaporate(grid, 0.1); // factor = 0.9

		expect(grid[0]).toBeCloseTo(9, 5);
		expect(grid[4]).toBeCloseTo(18, 5);
	});

	it('zeroes the grid when evaporation rate is 1', () => {
		const grid = createPheromoneGrid(3, 3);
		grid[0] = 100;
		grid[5] = 50;

		evaporate(grid, 1.0);

		for (const cell of grid) {
			expect(cell).toBe(0);
		}
	});

	it('does nothing when evaporation rate is 0', () => {
		const grid = createPheromoneGrid(2, 2);
		grid[0] = 7;
		grid[3] = 13;

		evaporate(grid, 0);

		expect(grid[0]).toBeCloseTo(7, 5);
		expect(grid[3]).toBeCloseTo(13, 5);
	});
});

describe('getPheromone', () => {
	it('returns 0 for out-of-bounds coordinates', () => {
		const grid = createPheromoneGrid(3, 3);
		grid[0] = 99;

		expect(getPheromone(grid, 3, 3, -1, 0)).toBe(0);
		expect(getPheromone(grid, 3, 3, 0, -1)).toBe(0);
		expect(getPheromone(grid, 3, 3, 3, 0)).toBe(0);
		expect(getPheromone(grid, 3, 3, 0, 3)).toBe(0);
	});

	it('returns the correct value for valid coordinates', () => {
		const cols = 4;
		const rows = 3;
		const grid = createPheromoneGrid(cols, rows);
		deposit(grid, cols, 2, 1, 15, 1);

		expect(getPheromone(grid, cols, rows, 2, 1)).toBeCloseTo(15, 5);
	});

	it('returns 0 for cells that have not been deposited on', () => {
		const grid = createPheromoneGrid(5, 5);
		expect(getPheromone(grid, 5, 5, 2, 2)).toBe(0);
	});
});
