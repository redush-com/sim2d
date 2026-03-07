import type { ApfAgentState } from './types';
import * as vec from '../../math/vector';

/**
 * Checks whether an agent's velocity is below the stuck threshold.
 * @param agent - agent to check
 * @param threshold - velocity magnitude below which the agent is considered stuck
 * @returns true if agent velocity is below threshold
 */
export function isStuck(agent: ApfAgentState, threshold: number): boolean {
  return vec.magnitude(agent.velocity) < threshold;
}

/**
 * Updates the stuck counter: increments if stuck, resets to 0 otherwise.
 * @param agent - current agent state
 * @param threshold - velocity threshold for stuck detection
 * @returns agent with updated stuckCounter
 */
export function updateStuckCounter(agent: ApfAgentState, threshold: number): ApfAgentState {
  return {
    ...agent,
    stuckCounter: isStuck(agent, threshold) ? agent.stuckCounter + 1 : 0,
  };
}

/**
 * Applies a random perturbation to escape a local minimum.
 * Adds a random velocity impulse and resets the stuck counter.
 * @param agent - agent trapped in local minimum
 * @param strength - magnitude of the random perturbation
 * @returns agent with perturbed velocity and reset counter
 */
export function applyPerturbation(agent: ApfAgentState, strength: number): ApfAgentState {
  const perturbation = vec.scale(vec.randomUnit(), strength);
  return {
    ...agent,
    velocity: vec.add(agent.velocity, perturbation),
    stuckCounter: 0,
  };
}
