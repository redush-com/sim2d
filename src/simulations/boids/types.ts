import type { Vec2 } from '../../types';

/** Tunable Boids flocking simulation parameters */
export interface BoidParams {
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
  perceptionRadius: number;
  maxSpeed: number;
  maxForce: number;
  agentCount: number;
}

/** State of a single boid agent */
export interface BoidAgent {
  id: number;
  position: Vec2;
  velocity: Vec2;
  trail: Vec2[];
}

/** Complete Boids simulation state */
export interface BoidState {
  agents: BoidAgent[];
  params: BoidParams;
  width: number;
  height: number;
}
