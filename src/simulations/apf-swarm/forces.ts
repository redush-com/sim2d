import type { Vec2 } from '../../types';
import type { Obstacle, ApfParams } from './types';
import * as vec from '../../math/vector';

/** Maximum attractive force magnitude to prevent overpowering repulsion */
const MAX_ATTRACTIVE_FORCE = 50;

/**
 * Computes the attractive force pulling an agent toward the goal.
 * Uses a conic field: linear when close, capped magnitude when far.
 * This prevents the attractive force from overpowering obstacle repulsion.
 * @param agentPos - current agent position
 * @param goalPos - goal position
 * @param kAtt - attractive force gain
 * @returns attractive force vector
 */
export function attractiveForce(agentPos: Vec2, goalPos: Vec2, kAtt: number): Vec2 {
  const diff = vec.sub(goalPos, agentPos);
  const dist = vec.magnitude(diff);
  if (dist < 1e-6) return vec.ZERO;

  const forceMag = Math.min(kAtt * dist, MAX_ATTRACTIVE_FORCE);
  return vec.scale(vec.normalize(diff), forceMag);
}

/**
 * Computes the repulsive force from a single obstacle on an agent.
 * Uses inverse-square repulsion with a distance cutoff at d0.
 * @param agentPos - current agent position
 * @param obstacle - the obstacle (position + radius)
 * @param kRep - repulsive force gain
 * @param d0 - influence distance threshold
 * @returns repulsive force vector away from the obstacle
 */
export function obstacleRepulsiveForce(
  agentPos: Vec2,
  obstacle: Obstacle,
  kRep: number,
  d0: number
): Vec2 {
  const diff = vec.sub(agentPos, obstacle.position);
  const rawDist = vec.magnitude(diff) - obstacle.radius;

  if (rawDist > d0) return vec.ZERO;

  const d = Math.max(rawDist, 0.5);
  const ratio = (d0 - d) / d;
  const repMagnitude = kRep * ratio * ratio;
  return vec.scale(vec.normalize(diff), repMagnitude);
}

/**
 * Computes the repulsive force between two robots to maintain spacing.
 * Uses the same inverse-square formulation as obstacle repulsion.
 * @param agentPos - current agent position
 * @param otherPos - other agent's position
 * @param kRepRobot - inter-robot repulsion gain
 * @param dRobot - inter-robot influence distance threshold
 * @returns repulsive force vector away from the other agent
 */
export function interRobotRepulsiveForce(
  agentPos: Vec2,
  otherPos: Vec2,
  kRepRobot: number,
  dRobot: number
): Vec2 {
  const diff = vec.sub(agentPos, otherPos);
  const dist = vec.magnitude(diff);

  if (dist > dRobot) return vec.ZERO;

  const d = Math.max(dist, 0.5);
  const ratio = (dRobot - d) / d;
  const repMagnitude = kRepRobot * ratio * ratio;
  return vec.scale(vec.normalize(diff), repMagnitude);
}

/**
 * Computes the total APF force on an agent from all sources:
 * attraction to goal + obstacle repulsion + inter-robot repulsion.
 * @param agentPos - current agent position
 * @param goalPos - goal position
 * @param obstacles - array of obstacles in the environment
 * @param otherAgentPositions - positions of all other agents
 * @param params - simulation parameters containing force gains
 * @returns the net force vector
 */
export function totalForce(
  agentPos: Vec2,
  goalPos: Vec2,
  obstacles: Obstacle[],
  otherAgentPositions: Vec2[],
  params: ApfParams
): Vec2 {
  let force = attractiveForce(agentPos, goalPos, params.kAtt);

  for (const obs of obstacles) {
    force = vec.add(force, obstacleRepulsiveForce(agentPos, obs, params.kRep, params.d0));
  }

  for (const otherPos of otherAgentPositions) {
    force = vec.add(force, interRobotRepulsiveForce(agentPos, otherPos, params.kRepRobot, params.dRobot));
  }

  return force;
}
