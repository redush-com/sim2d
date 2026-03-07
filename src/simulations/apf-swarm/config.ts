import type { ApfParams } from './types';

/** Default simulation parameters tuned for visually appealing swarm behavior */
export const DEFAULT_PARAMS: ApfParams = {
	kAtt: 1.0,
	kRep: 15.0,
	kRepRobot: 8.0,
	d0: 100,
	dRobot: 60,
	agentCount: 10,
	maxSpeed: 200,
	trailLength: 100,
	perturbStrength: 80,
	stuckThreshold: 0.5,
	stuckFrames: 60,
};

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;

/** Color palette for agents (HSL hues distributed evenly) */
export const AGENT_COLORS = Array.from(
	{ length: 20 },
	(_, i) => `hsl(${(i * 360) / 20}, 80%, 60%)`,
);
