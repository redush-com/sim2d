import type { Vec2 } from '../../types';
import type { ApfAgentState, ApfParams } from './types';
import * as vec from '../../math/vector';

/**
 * Creates a new agent at the given position with zero velocity.
 * @param id - unique agent identifier
 * @param position - initial spawn position
 * @returns a fresh ApfAgentState
 */
export function createAgent(id: number, position: Vec2): ApfAgentState {
  return {
    id,
    position,
    velocity: vec.ZERO,
    trail: [position],
    stuckCounter: 0,
  };
}

/** Smoothing factor: 0 = instant response, 1 = no response. Controls inertia. */
const VELOCITY_SMOOTHING = 0.85;

/**
 * Updates an agent's state using the APF force as a desired velocity direction.
 * Unlike acceleration-based updates, this prevents momentum from carrying agents
 * through obstacles. Smoothing adds slight inertia for natural-looking movement.
 * @param agent - current agent state
 * @param force - net force vector (treated as desired velocity)
 * @param dt - time step in seconds
 * @param params - simulation parameters for maxSpeed and trailLength
 * @returns updated agent state
 */
export function updateAgent(
  agent: ApfAgentState,
  force: Vec2,
  dt: number,
  params: ApfParams
): ApfAgentState {
  const forceMag = vec.magnitude(force);
  const speed = forceMag > 0.01 ? Math.min(forceMag, 1) * params.maxSpeed : 0;
  const desiredVelocity = forceMag > 0.01
    ? vec.scale(vec.normalize(force), speed)
    : vec.ZERO;
  const newVelocity = vec.add(
    vec.scale(agent.velocity, VELOCITY_SMOOTHING),
    vec.scale(desiredVelocity, 1 - VELOCITY_SMOOTHING)
  );
  const newPosition = vec.add(agent.position, vec.scale(newVelocity, dt));

  const trail = [...agent.trail, newPosition];
  if (trail.length > params.trailLength) {
    trail.splice(0, trail.length - params.trailLength);
  }

  return {
    ...agent,
    position: newPosition,
    velocity: newVelocity,
    trail,
  };
}
