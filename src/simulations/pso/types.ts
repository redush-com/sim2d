import type { Vec2 } from '../../types';

/** Tunable PSO simulation parameters (Kennedy & Eberhart, 1995) */
export interface PsoParams {
	/** Inertia weight controlling velocity momentum */
	inertiaWeight: number;
	/** Cognitive coefficient: pull toward personal best */
	cognitiveWeight: number;
	/** Social coefficient: pull toward global best */
	socialWeight: number;
	/** Number of particles in the swarm */
	particleCount: number;
	/** Maximum velocity magnitude per tick */
	maxSpeed: number;
	/** Index of the active fitness function (0=Rastrigin, 1=Rosenbrock, 2=Ackley, 3=Sphere) */
	functionIndex: number;
}

/** A single particle in the swarm */
export interface Particle {
	/** Current position in search space */
	position: Vec2;
	/** Current velocity in search space */
	velocity: Vec2;
	/** Best position this particle has visited */
	personalBestPosition: Vec2;
	/** Best fitness value this particle has achieved */
	personalBestValue: number;
}

/** Complete PSO simulation state */
export interface PsoState {
	/** All particles in the swarm */
	particles: Particle[];
	/** Best position found by any particle */
	globalBestPosition: Vec2;
	/** Best fitness value found by any particle */
	globalBestValue: number;
	/** Current simulation parameters */
	params: PsoParams;
	/** Pre-computed heatmap data for the active fitness function (row-major, normalized [0,1]) */
	heatmapData: number[];
}
