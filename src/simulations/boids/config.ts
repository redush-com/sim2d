import type { BoidParams } from './types';

/** Default Boids parameters tuned for visually appealing flocking behavior */
export const DEFAULT_PARAMS: BoidParams = {
  separationWeight: 1.5,
  alignmentWeight: 1.0,
  cohesionWeight: 1.0,
  perceptionRadius: 100,
  maxSpeed: 200,
  maxForce: 10,
  agentCount: 50,
};

/** Maximum number of trail positions to store per agent */
export const TRAIL_LENGTH = 15;

/** Color palette for agents (HSL hues distributed evenly) */
export const AGENT_COLORS = Array.from({ length: 50 }, (_, i) =>
  `hsl(${(i * 360) / 50}, 80%, 60%)`
);
