import type { Vec2 } from '../../types';
import type { ApfAgentState, Obstacle, ApfParams, ApfSimulationState } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config';
import { createAgent, updateAgent } from './agent';
import { createDefaultObstacles } from './obstacle';
import { totalForce } from './forces';
import { updateStuckCounter, applyPerturbation } from './local-minima';
import * as vec from '../../math/vector';

/**
 * Generates random spawn positions for agents on the left side of the canvas.
 * @param count - number of agents to spawn
 * @returns array of spawn positions
 */
function generateSpawnPositions(count: number): Vec2[] {
	return Array.from({ length: count }, (_, i) => ({
		x: 50 + Math.random() * 150,
		y: (CANVAS_HEIGHT / (count + 1)) * (i + 1) + (Math.random() - 0.5) * 40,
	}));
}

/**
 * Creates a fresh simulation state with agents, obstacles, and a goal.
 * @param params - simulation parameters
 * @returns initial simulation state
 */
export function createSimulation(params: ApfParams): ApfSimulationState {
	const positions = generateSpawnPositions(params.agentCount);
	return {
		agents: positions.map((pos, i) => createAgent(i, pos)),
		obstacles: createDefaultObstacles(),
		goalPosition: { x: CANVAS_WIDTH - 100, y: CANVAS_HEIGHT / 2 },
		params,
	};
}

/**
 * Advances the simulation by one time step. Computes forces for each agent,
 * detects and escapes local minima, and updates agent states.
 * @param state - current simulation state
 * @param dt - time step in seconds
 * @returns updated simulation state
 */
export function tick(state: ApfSimulationState, dt: number): ApfSimulationState {
	const { agents, obstacles, goalPosition, params } = state;

	const updatedAgents = agents.map((agent) => {
		const otherPositions = agents
			.filter((other) => other.id !== agent.id)
			.map((other) => other.position);

		const force = totalForce(agent.position, goalPosition, obstacles, otherPositions, params);
		let updated = updateAgent(agent, force, dt, params);
		updated = enforceObstacleConstraints(updated, obstacles);
		updated = updateStuckCounter(updated, params.stuckThreshold);

		if (updated.stuckCounter >= params.stuckFrames) {
			updated = applyPerturbation(updated, params.perturbStrength);
		}

		return updated;
	});

	return { ...state, agents: updatedAgents };
}

/**
 * Enforces hard collision constraints: pushes an agent outside any obstacle
 * it has penetrated and zeros the velocity component pointing into the obstacle.
 * @param agent - agent to constrain
 * @param obstacles - array of obstacles
 * @returns agent with corrected position and velocity
 */
function enforceObstacleConstraints(agent: ApfAgentState, obstacles: Obstacle[]): ApfAgentState {
	let { position, velocity } = agent;
	const margin = 2;

	for (const obs of obstacles) {
		const diff = vec.sub(position, obs.position);
		const dist = vec.magnitude(diff);
		const minDist = obs.radius + margin;

		if (dist < minDist) {
			const normal = dist > 0.01 ? vec.normalize(diff) : vec.randomUnit();
			position = vec.add(obs.position, vec.scale(normal, minDist));

			const velDotNormal = velocity.x * normal.x + velocity.y * normal.y;
			if (velDotNormal < 0) {
				velocity = vec.sub(velocity, vec.scale(normal, velDotNormal));
			}
		}
	}

	if (position === agent.position) return agent;
	return { ...agent, position, velocity };
}

/**
 * Updates the goal position in the simulation state.
 * @param state - current state
 * @param position - new goal position
 * @returns state with updated goal
 */
export function setGoalPosition(state: ApfSimulationState, position: Vec2): ApfSimulationState {
	return { ...state, goalPosition: position };
}

/**
 * Updates the position of a specific obstacle.
 * @param state - current state
 * @param index - obstacle index
 * @param position - new obstacle position
 * @returns state with updated obstacle
 */
export function setObstaclePosition(
	state: ApfSimulationState,
	index: number,
	position: Vec2,
): ApfSimulationState {
	const obstacles = state.obstacles.map((obs, i) => (i === index ? { ...obs, position } : obs));
	return { ...state, obstacles };
}

/**
 * Updates simulation parameters, re-creating agents if count changed.
 * @param state - current state
 * @param params - new parameters
 * @returns state with updated params (and possibly new agents)
 */
export function updateParams(state: ApfSimulationState, params: ApfParams): ApfSimulationState {
	if (params.agentCount !== state.agents.length) {
		const positions = generateSpawnPositions(params.agentCount);
		return {
			...state,
			params,
			agents: positions.map((pos, i) => createAgent(i, pos)),
		};
	}
	return { ...state, params };
}

/**
 * Resets all agents to new random spawn positions while keeping obstacles and goal.
 * @param state - current state
 * @returns state with reset agents
 */
export function resetAgents(state: ApfSimulationState): ApfSimulationState {
	const positions = generateSpawnPositions(state.params.agentCount);
	return {
		...state,
		agents: positions.map((pos, i) => createAgent(i, pos)),
	};
}
