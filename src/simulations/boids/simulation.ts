import type { Vec2 } from '../../types';
import type { BoidAgent, BoidParams, BoidState } from './types';
import { TRAIL_LENGTH } from './config';
import { separation, alignment, cohesion } from './behaviors';
import * as vec from '../../math/vector';

/**
 * Creates a single boid agent at a random position with a random velocity.
 * @param id - unique agent identifier
 * @param width - canvas width for random placement
 * @param height - canvas height for random placement
 * @param maxSpeed - maximum speed to cap initial velocity
 * @returns a new BoidAgent
 */
function createAgent(id: number, width: number, height: number, maxSpeed: number): BoidAgent {
	const position: Vec2 = {
		x: Math.random() * width,
		y: Math.random() * height,
	};
	const velocity = vec.scale(vec.randomUnit(), maxSpeed * 0.5);
	return { id, position, velocity, trail: [position] };
}

/**
 * Creates a fresh Boids simulation state with randomly placed agents.
 * @param params - simulation parameters
 * @param width - canvas width in CSS pixels
 * @param height - canvas height in CSS pixels
 * @returns initial simulation state
 */
export function createSimulation(params: BoidParams, width: number, height: number): BoidState {
	const agents = Array.from({ length: params.agentCount }, (_, i) =>
		createAgent(i, width, height, params.maxSpeed),
	);
	return { agents, params, width, height };
}

/**
 * Finds all neighbors of a boid within the perception radius.
 * @param agent - the boid to find neighbors for
 * @param agents - all boids in the simulation
 * @param radius - perception radius
 * @returns array of neighboring boids (excluding self)
 */
function findNeighbors(agent: BoidAgent, agents: BoidAgent[], radius: number): BoidAgent[] {
	return agents.filter(
		(other) => other.id !== agent.id && vec.distance(agent.position, other.position) < radius,
	);
}

/**
 * Wraps a position to stay within the toroidal bounds.
 * Agents exiting one edge reappear on the opposite side.
 * @param position - position to wrap
 * @param width - canvas width
 * @param height - canvas height
 * @returns wrapped position
 */
function wrapPosition(position: Vec2, width: number, height: number): Vec2 {
	let { x, y } = position;
	if (x < 0) x += width;
	else if (x > width) x -= width;
	if (y < 0) y += height;
	else if (y > height) y -= height;
	return { x, y };
}

/**
 * Updates a single boid by computing flocking forces and integrating velocity.
 * @param agent - current boid state
 * @param agents - all boids for neighbor lookup
 * @param params - simulation parameters
 * @param dt - time step in seconds
 * @param width - canvas width for wrapping
 * @param height - canvas height for wrapping
 * @returns updated boid state
 */
function updateAgent(
	agent: BoidAgent,
	agents: BoidAgent[],
	params: BoidParams,
	dt: number,
	width: number,
	height: number,
): BoidAgent {
	const neighbors = findNeighbors(agent, agents, params.perceptionRadius);

	const sep = vec.scale(separation(agent, neighbors), params.separationWeight);
	const ali = vec.scale(alignment(agent, neighbors), params.alignmentWeight);
	const coh = vec.scale(cohesion(agent, neighbors), params.cohesionWeight);

	const force = vec.clampMagnitude(vec.add(vec.add(sep, ali), coh), params.maxForce);
	const newVelocity = vec.clampMagnitude(vec.add(agent.velocity, force), params.maxSpeed);
	const newPosition = wrapPosition(
		vec.add(agent.position, vec.scale(newVelocity, dt)),
		width,
		height,
	);

	const trail = [...agent.trail, newPosition];
	if (trail.length > TRAIL_LENGTH) {
		trail.splice(0, trail.length - TRAIL_LENGTH);
	}

	return { ...agent, position: newPosition, velocity: newVelocity, trail };
}

/**
 * Advances the simulation by one time step, updating all boids.
 * @param state - current simulation state
 * @param dt - time step in seconds
 * @returns updated simulation state
 */
export function tick(state: BoidState, dt: number): BoidState {
	const { agents, params, width, height } = state;
	const updatedAgents = agents.map((agent) =>
		updateAgent(agent, agents, params, dt, width, height),
	);
	return { ...state, agents: updatedAgents };
}

/**
 * Updates simulation parameters, re-creating agents if count changed.
 * @param state - current state
 * @param params - new parameters
 * @returns state with updated params (and possibly new agents)
 */
export function updateParams(state: BoidState, params: BoidParams): BoidState {
	if (params.agentCount !== state.agents.length) {
		return createSimulation(params, state.width, state.height);
	}
	return { ...state, params };
}

/**
 * Resets all agents to new random positions while keeping parameters.
 * @param state - current state
 * @returns state with freshly spawned agents
 */
export function resetAgents(state: BoidState): BoidState {
	return createSimulation(state.params, state.width, state.height);
}
