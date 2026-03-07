/** 2D vector with x and y components */
export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

/** Tunable simulation parameters */
export interface SimulationParams {
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
export interface AgentState {
  id: number;
  position: Vec2;
  velocity: Vec2;
  trail: Vec2[];
  stuckCounter: number;
}

/** Complete simulation state */
export interface SimulationState {
  agents: AgentState[];
  obstacles: Obstacle[];
  goalPosition: Vec2;
  params: SimulationParams;
}
