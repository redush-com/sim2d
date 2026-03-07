import type { PsoParams } from './types';

/** Default PSO parameters tuned for visually appealing optimization behavior */
export const DEFAULT_PARAMS: PsoParams = {
  inertiaWeight: 0.7,
  cognitiveWeight: 1.5,
  socialWeight: 1.5,
  particleCount: 30,
  maxSpeed: 5,
  functionIndex: 0,
};

/** Search space boundaries for particle positions */
export const SEARCH_BOUNDS = {
  min: -5.12,
  max: 5.12,
} as const;

/** Range of the search space */
export const SEARCH_RANGE = SEARCH_BOUNDS.max - SEARCH_BOUNDS.min;

/** Resolution of the fitness landscape heatmap grid */
export const HEATMAP_COLS = 60;
export const HEATMAP_ROWS = 60;

/** Names of available fitness functions, indexed by functionIndex */
export const FUNCTION_NAMES = ['Rastrigin', 'Rosenbrock', 'Ackley', 'Sphere'] as const;
