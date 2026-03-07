import type { SimulationParams } from './types';

/** Default simulation parameters tuned for visually appealing swarm behavior */
export const DEFAULT_PARAMS: SimulationParams = {
  kAtt: 1.0,
  kRep: 100.0,
  kRepRobot: 50.0,
  d0: 80,
  dRobot: 50,
  agentCount: 10,
  maxSpeed: 200,
  trailLength: 100,
  perturbStrength: 50,
  stuckThreshold: 0.5,
  stuckFrames: 60,
};

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;

/** Color palette for agents (HSL hues distributed evenly) */
export const AGENT_COLORS = Array.from({ length: 20 }, (_, i) =>
  `hsl(${(i * 360) / 20}, 80%, 60%)`
);
