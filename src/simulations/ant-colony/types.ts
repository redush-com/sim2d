/** Ant behavioral state: searching for food or returning to nest */
export type AntState = 'searching' | 'returning';

/** Tunable ACO simulation parameters */
export interface AcoParams {
	/** Rate at which pheromone evaporates each tick */
	evaporationRate: number;
	/** Base pheromone amount deposited per cell */
	pheromoneStrength: number;
	/** Probability of ignoring pheromone and moving randomly */
	explorationBias: number;
	/** Ant movement speed in pixels per tick */
	antSpeed: number;
	/** Number of ants in the simulation */
	antCount: number;
}

/** State of a single ant agent */
export interface Ant {
	/** Current grid column */
	x: number;
	/** Current grid row */
	y: number;
	/** Whether the ant is searching for food or returning to nest */
	state: AntState;
	/** Number of cells traversed since last state change */
	pathLength: number;
}

/** Complete ACO simulation state */
export interface AcoState {
	/** Array of all ant agents */
	ants: Ant[];
	/** Flat pheromone concentration grid (row-major, cols * rows) */
	pheromones: Float32Array;
	/** Number of grid columns */
	cols: number;
	/** Number of grid rows */
	rows: number;
	/** Grid cell size in pixels */
	cellSize: number;
	/** Nest position in grid coordinates */
	nest: { x: number; y: number };
	/** Food source position in grid coordinates */
	food: { x: number; y: number };
	/** Current simulation parameters */
	params: AcoParams;
}
