import type { Vec2 } from '../../types';

/** Tunable Firefly Algorithm parameters (Yang, 2008) */
export interface FireflyParams {
	/** Base attraction coefficient (beta0) controlling pull strength */
	attractiveness: number;
	/** Light absorption coefficient (gamma) controlling how quickly attraction fades with distance */
	lightAbsorption: number;
	/** Randomness scale (alpha) for stochastic movement */
	randomness: number;
	/** Number of fireflies in the swarm */
	fireflyCount: number;
	/** Index of the active fitness function (0=Rastrigin, 1=Rosenbrock, 2=Ackley, 3=Sphere) */
	functionIndex: number;
}

/** A single firefly in the swarm */
export interface Firefly {
	/** Current position in search space */
	position: Vec2;
	/** Brightness value derived from fitness: 1 / (1 + fitness) */
	brightness: number;
}

/** Complete Firefly Algorithm simulation state */
export interface FireflyState {
	/** All fireflies in the swarm */
	fireflies: Firefly[];
	/** Best position found by any firefly */
	globalBestPosition: Vec2;
	/** Best fitness value found by any firefly */
	globalBestValue: number;
	/** Current simulation parameters */
	params: FireflyParams;
	/** Pre-computed heatmap data for the active fitness function (row-major, normalized [0,1]) */
	heatmapData: number[];
}
