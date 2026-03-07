/**
 * Creates a new pheromone grid initialized to zero.
 * @param cols - number of grid columns
 * @param rows - number of grid rows
 * @returns a zero-filled Float32Array of size cols * rows
 */
export function createPheromoneGrid(cols: number, rows: number): Float32Array {
	return new Float32Array(cols * rows);
}

/**
 * Applies evaporation to the entire pheromone grid by multiplying
 * each cell by (1 - evaporationRate).
 * @param grid - pheromone grid to evaporate
 * @param evaporationRate - fraction of pheromone lost per tick
 */
export function evaporate(grid: Float32Array, evaporationRate: number): void {
	const factor = 1 - evaporationRate;
	for (let i = 0; i < grid.length; i++) {
		grid[i] *= factor;
	}
}

/**
 * Deposits pheromone at a specific grid cell. The amount deposited is
 * inversely proportional to the ant's path length, rewarding shorter paths.
 * @param grid - pheromone grid
 * @param cols - number of grid columns
 * @param x - grid column to deposit at
 * @param y - grid row to deposit at
 * @param strength - base pheromone strength
 * @param pathLength - length of the ant's current path (used as inverse weight)
 */
export function deposit(
	grid: Float32Array,
	cols: number,
	x: number,
	y: number,
	strength: number,
	pathLength: number,
): void {
	const amount = strength / Math.max(pathLength, 1);
	grid[y * cols + x] += amount;
}

/**
 * Reads the pheromone concentration at a specific grid cell.
 * Returns 0 for out-of-bounds coordinates.
 * @param grid - pheromone grid
 * @param cols - number of grid columns
 * @param rows - number of grid rows
 * @param x - grid column
 * @param y - grid row
 * @returns pheromone concentration at (x, y)
 */
export function getPheromone(
	grid: Float32Array,
	cols: number,
	rows: number,
	x: number,
	y: number,
): number {
	if (x < 0 || x >= cols || y < 0 || y >= rows) return 0;
	return grid[y * cols + x];
}
