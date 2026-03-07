import type { AcoParams } from './types';

/** Default ACO parameters tuned for visually appealing pheromone trail formation */
export const DEFAULT_PARAMS: AcoParams = {
	evaporationRate: 0.02,
	pheromoneStrength: 3,
	explorationBias: 0.1,
	antSpeed: 4,
	antCount: 50,
};

/** Grid cell size in pixels */
export const CELL_SIZE = 8;

/** Pheromone weight exponent (alpha) for probabilistic cell selection */
export const PHEROMONE_ALPHA = 2;

/** Nest offset from top-left corner in grid cells */
export const NEST_OFFSET = 3;

/** Food offset from bottom-right corner in grid cells */
export const FOOD_OFFSET = 3;
