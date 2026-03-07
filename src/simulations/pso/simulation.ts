import type { Vec2 } from '../../types';
import type { Particle, PsoParams, PsoState } from './types';
import { SEARCH_BOUNDS, SEARCH_RANGE, HEATMAP_COLS, HEATMAP_ROWS } from './config';
import { getFitnessFunction } from './fitness';
import * as vec from '../../math/vector';

/**
 * Creates a random particle within the search space bounds.
 * Position is uniformly distributed; velocity starts small and random.
 * @param fitnessFn - fitness function to evaluate initial personal best
 * @returns a new particle with evaluated personal best
 */
function createParticle(fitnessFn: (x: number, y: number) => number): Particle {
	const position: Vec2 = {
		x: SEARCH_BOUNDS.min + Math.random() * SEARCH_RANGE,
		y: SEARCH_BOUNDS.min + Math.random() * SEARCH_RANGE,
	};
	const velocity: Vec2 = {
		x: (Math.random() - 0.5) * 2,
		y: (Math.random() - 0.5) * 2,
	};
	const value = fitnessFn(position.x, position.y);

	return {
		position,
		velocity,
		personalBestPosition: position,
		personalBestValue: value,
	};
}

/**
 * Pre-computes a normalized heatmap of fitness values over the search space.
 * Values are normalized to [0, 1] where 0 is the minimum and 1 is the maximum.
 * @param functionIndex - index of the fitness function to sample
 * @returns flat row-major array of normalized fitness values
 */
export function computeHeatmapData(functionIndex: number): number[] {
	const fitnessFn = getFitnessFunction(functionIndex);
	const data = new Array<number>(HEATMAP_COLS * HEATMAP_ROWS);

	let minVal = Infinity;
	let maxVal = -Infinity;

	for (let r = 0; r < HEATMAP_ROWS; r++) {
		for (let c = 0; c < HEATMAP_COLS; c++) {
			const x = SEARCH_BOUNDS.min + (c / (HEATMAP_COLS - 1)) * SEARCH_RANGE;
			const y = SEARCH_BOUNDS.min + (r / (HEATMAP_ROWS - 1)) * SEARCH_RANGE;
			const val = fitnessFn(x, y);
			data[r * HEATMAP_COLS + c] = val;
			if (val < minVal) minVal = val;
			if (val > maxVal) maxVal = val;
		}
	}

	const range = maxVal - minVal || 1;
	for (let i = 0; i < data.length; i++) {
		data[i] = (data[i] - minVal) / range;
	}

	return data;
}

/**
 * Creates a fresh PSO simulation state with randomly initialized particles.
 * @param params - simulation parameters
 * @returns initial simulation state with evaluated particles and heatmap
 */
export function createSimulation(params: PsoParams): PsoState {
	const fitnessFn = getFitnessFunction(params.functionIndex);
	const particles = Array.from({ length: params.particleCount }, () => createParticle(fitnessFn));

	const { globalBestPosition, globalBestValue } = findGlobalBest(particles);

	return {
		particles,
		globalBestPosition,
		globalBestValue,
		params,
		heatmapData: computeHeatmapData(params.functionIndex),
	};
}

/**
 * Finds the best position and value across all particles.
 * @param particles - array of particles to search
 * @returns the global best position and fitness value
 */
function findGlobalBest(particles: Particle[]): {
	globalBestPosition: Vec2;
	globalBestValue: number;
} {
	let bestIdx = 0;
	for (let i = 1; i < particles.length; i++) {
		if (particles[i].personalBestValue < particles[bestIdx].personalBestValue) {
			bestIdx = i;
		}
	}
	return {
		globalBestPosition: particles[bestIdx].personalBestPosition,
		globalBestValue: particles[bestIdx].personalBestValue,
	};
}

/**
 * Clamps a position to the search space bounds.
 * @param pos - position to clamp
 * @returns clamped position within bounds
 */
function clampPosition(pos: Vec2): Vec2 {
	return {
		x: Math.max(SEARCH_BOUNDS.min, Math.min(SEARCH_BOUNDS.max, pos.x)),
		y: Math.max(SEARCH_BOUNDS.min, Math.min(SEARCH_BOUNDS.max, pos.y)),
	};
}

/**
 * Updates a single particle's velocity and position using the PSO update rule:
 * v = w*v + c1*r1*(pBest - pos) + c2*r2*(gBest - pos), then pos += v.
 * @param particle - particle to update
 * @param globalBest - current global best position
 * @param params - PSO parameters (inertia, cognitive, social weights)
 * @param fitnessFn - fitness function for evaluating new position
 * @returns updated particle with new position, velocity, and personal best
 */
function updateParticle(
	particle: Particle,
	globalBest: Vec2,
	params: PsoParams,
	fitnessFn: (x: number, y: number) => number,
): Particle {
	const r1 = Math.random();
	const r2 = Math.random();

	const inertia = vec.scale(particle.velocity, params.inertiaWeight);
	const cognitive = vec.scale(
		vec.sub(particle.personalBestPosition, particle.position),
		params.cognitiveWeight * r1,
	);
	const social = vec.scale(vec.sub(globalBest, particle.position), params.socialWeight * r2);

	let newVelocity = vec.add(vec.add(inertia, cognitive), social);
	newVelocity = vec.clampMagnitude(newVelocity, params.maxSpeed);

	const newPosition = clampPosition(vec.add(particle.position, newVelocity));
	const newValue = fitnessFn(newPosition.x, newPosition.y);

	const isBetter = newValue < particle.personalBestValue;

	return {
		position: newPosition,
		velocity: newVelocity,
		personalBestPosition: isBetter ? newPosition : particle.personalBestPosition,
		personalBestValue: isBetter ? newValue : particle.personalBestValue,
	};
}

/**
 * Advances the PSO simulation by one tick. Updates all particle velocities
 * and positions, then recalculates the global best.
 * @param state - current simulation state
 * @param _dt - time delta (unused, PSO uses discrete steps)
 * @returns updated simulation state
 */
export function tick(state: PsoState, _dt: number): PsoState {
	const fitnessFn = getFitnessFunction(state.params.functionIndex);

	const updatedParticles = state.particles.map((p) =>
		updateParticle(p, state.globalBestPosition, state.params, fitnessFn),
	);

	const best = findGlobalBest(updatedParticles);
	const globalBestPosition =
		best.globalBestValue < state.globalBestValue
			? best.globalBestPosition
			: state.globalBestPosition;
	const globalBestValue = Math.min(best.globalBestValue, state.globalBestValue);

	return { ...state, particles: updatedParticles, globalBestPosition, globalBestValue };
}

/**
 * Updates simulation parameters. Re-creates particles if count changed.
 * @param state - current state
 * @param params - new parameters
 * @returns state with updated params
 */
export function updateParams(state: PsoState, params: PsoParams): PsoState {
	if (params.particleCount !== state.params.particleCount) {
		return createSimulation(params);
	}
	return { ...state, params };
}

/**
 * Resets all particles to new random positions while keeping params.
 * @param state - current state
 * @returns state with freshly initialized particles
 */
export function resetParticles(state: PsoState): PsoState {
	return createSimulation(state.params);
}

/**
 * Switches the active fitness function and resets the simulation.
 * @param state - current state
 * @param functionIndex - new fitness function index
 * @returns fresh state with new function and recomputed heatmap
 */
export function setFunction(state: PsoState, functionIndex: number): PsoState {
	return createSimulation({ ...state.params, functionIndex });
}
