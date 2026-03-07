import type { Vec2 } from '../../types';
import type { BoidAgent } from './types';
import * as vec from '../../math/vector';

/**
 * Computes the separation steering force for a boid.
 * Steers away from nearby neighbors to avoid crowding.
 * The force is inversely weighted by distance so closer neighbors push harder.
 * @param agent - the boid computing its steering
 * @param neighbors - array of neighboring boids within perception radius
 * @returns separation steering vector (unnormalized)
 */
export function separation(agent: BoidAgent, neighbors: BoidAgent[]): Vec2 {
  if (neighbors.length === 0) return vec.ZERO;

  let steer = vec.ZERO;

  for (const other of neighbors) {
    const diff = vec.sub(agent.position, other.position);
    const dist = vec.magnitude(diff);
    if (dist < 1e-6) continue;
    steer = vec.add(steer, vec.scale(vec.normalize(diff), 1 / dist));
  }

  return neighbors.length > 0 ? vec.scale(steer, 1 / neighbors.length) : vec.ZERO;
}

/**
 * Computes the alignment steering force for a boid.
 * Steers toward the average heading (velocity) of nearby neighbors.
 * @param agent - the boid computing its steering
 * @param neighbors - array of neighboring boids within perception radius
 * @returns alignment steering vector pointing toward average neighbor heading
 */
export function alignment(agent: BoidAgent, neighbors: BoidAgent[]): Vec2 {
  if (neighbors.length === 0) return vec.ZERO;

  let avgVelocity = vec.ZERO;

  for (const other of neighbors) {
    avgVelocity = vec.add(avgVelocity, other.velocity);
  }

  avgVelocity = vec.scale(avgVelocity, 1 / neighbors.length);
  return vec.sub(avgVelocity, agent.velocity);
}

/**
 * Computes the cohesion steering force for a boid.
 * Steers toward the center of mass of nearby neighbors.
 * @param agent - the boid computing its steering
 * @param neighbors - array of neighboring boids within perception radius
 * @returns cohesion steering vector pointing toward neighbor center of mass
 */
export function cohesion(agent: BoidAgent, neighbors: BoidAgent[]): Vec2 {
  if (neighbors.length === 0) return vec.ZERO;

  let center = vec.ZERO;

  for (const other of neighbors) {
    center = vec.add(center, other.position);
  }

  center = vec.scale(center, 1 / neighbors.length);
  return vec.sub(center, agent.position);
}
