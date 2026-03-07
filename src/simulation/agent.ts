import type { Vec2, AgentState, SimulationParams } from '../types';
import * as vec from '../math/vector';

/**
 * Creates a new agent at the given position with zero velocity.
 * @param id - unique agent identifier
 * @param position - initial spawn position
 * @returns a fresh AgentState
 */
export function createAgent(id: number, position: Vec2): AgentState {
  return {
    id,
    position,
    velocity: vec.ZERO,
    trail: [position],
    stuckCounter: 0,
  };
}

/**
 * Updates an agent's state by applying a force over a time step.
 * Force is treated as acceleration (unit mass), velocity is clamped to maxSpeed,
 * and the trail is maintained as a bounded ring buffer.
 * @param agent - current agent state
 * @param force - net force vector to apply
 * @param dt - time step in seconds
 * @param params - simulation parameters for maxSpeed and trailLength
 * @returns updated agent state
 */
export function updateAgent(
  agent: AgentState,
  force: Vec2,
  dt: number,
  params: SimulationParams
): AgentState {
  const newVelocity = vec.clampMagnitude(
    vec.add(agent.velocity, vec.scale(force, dt)),
    params.maxSpeed
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
