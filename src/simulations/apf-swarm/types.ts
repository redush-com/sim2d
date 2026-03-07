import type { Vec2 } from '../../types';

/** Tunable APF simulation parameters */
export interface ApfParams {
	kAtt: number;
	kRep: number;
	kRepRobot: number;
	d0: number;
	dRobot: number;
	agentCount: number;
	maxSpeed: number;
	trailLength: number;
	perturbStrength: number;
	stuckThreshold: number;
	stuckFrames: number;
}

/** Circular obstacle in the environment */
export interface Obstacle {
	position: Vec2;
	radius: number;
}

/** State of a single autonomous agent */
export interface ApfAgentState {
	id: number;
	position: Vec2;
	velocity: Vec2;
	trail: Vec2[];
	stuckCounter: number;
}

/** Complete APF simulation state */
export interface ApfSimulationState {
	agents: ApfAgentState[];
	obstacles: Obstacle[];
	goalPosition: Vec2;
	params: ApfParams;
}
