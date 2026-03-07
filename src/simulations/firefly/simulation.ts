import type { Vec2 } from '../../types';
import type { Firefly, FireflyParams, FireflyState } from './types';
import { SEARCH_BOUNDS, SEARCH_RANGE, HEATMAP_COLS, HEATMAP_ROWS } from './config';
import { getFitnessFunction } from '../pso/fitness';

/**
 * Creates a random firefly within the search space bounds.
 * Position is uniformly distributed; brightness is computed from fitness.
 * @param fitnessFn - fitness function to evaluate brightness
 * @returns a new firefly with evaluated brightness
 */
function createFirefly(fitnessFn: (x: number, y: number) => number): Firefly {
	const position: Vec2 = {
		x: SEARCH_BOUNDS.min + Math.random() * SEARCH_RANGE,
		y: SEARCH_BOUNDS.min + Math.random() * SEARCH_RANGE,
	};
	const fitness = fitnessFn(position.x, position.y);

	return {
		position,
		brightness: 1 / (1 + fitness),
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
 * Finds the best (brightest) firefly and returns its position and fitness value.
 * @param fireflies - array of fireflies to search
 * @param fitnessFn - fitness function for computing the actual fitness value
 * @returns the global best position and fitness value
 */
function findGlobalBest(
	fireflies: Firefly[],
	fitnessFn: (x: number, y: number) => number,
): { globalBestPosition: Vec2; globalBestValue: number } {
	let bestIdx = 0;
	for (let i = 1; i < fireflies.length; i++) {
		if (fireflies[i].brightness > fireflies[bestIdx].brightness) {
			bestIdx = i;
		}
	}
	return {
		globalBestPosition: fireflies[bestIdx].position,
		globalBestValue: fitnessFn(fireflies[bestIdx].position.x, fireflies[bestIdx].position.y),
	};
}

/**
 * Creates a fresh Firefly simulation state with randomly initialized fireflies.
 * @param params - simulation parameters
 * @returns initial simulation state with evaluated fireflies and heatmap
 */
export function createSimulation(params: FireflyParams): FireflyState {
	const fitnessFn = getFitnessFunction(params.functionIndex);
	const fireflies = Array.from({ length: params.fireflyCount }, () => createFirefly(fitnessFn));

	const { globalBestPosition, globalBestValue } = findGlobalBest(fireflies, fitnessFn);

	return {
		fireflies,
		globalBestPosition,
		globalBestValue,
		params,
		heatmapData: computeHeatmapData(params.functionIndex),
	};
}

/**
 * Moves firefly i toward firefly j using the attraction formula.
 * beta = beta0 * exp(-gamma * r^2), then position += beta * (pos_j - pos_i) + alpha * (rand - 0.5).
 * @param posI - current position of firefly i
 * @param posJ - position of the brighter firefly j
 * @param distSquared - squared Euclidean distance between i and j
 * @param params - simulation parameters (attractiveness, lightAbsorption, randomness)
 * @returns the new position for firefly i after attraction
 */
function moveToward(posI: Vec2, posJ: Vec2, distSquared: number, params: FireflyParams): Vec2 {
	const beta = params.attractiveness * Math.exp(-params.lightAbsorption * distSquared);
	const alpha = params.randomness;

	return {
		x: posI.x + beta * (posJ.x - posI.x) + alpha * (Math.random() - 0.5),
		y: posI.y + beta * (posJ.y - posI.y) + alpha * (Math.random() - 0.5),
	};
}

/**
 * Advances the Firefly simulation by one tick. For each firefly, compares brightness
 * with all others and moves toward brighter neighbors. Recalculates brightness after.
 * @param state - current simulation state
 * @param _dt - time delta (unused, firefly algorithm uses discrete steps)
 * @returns updated simulation state
 */
export function tick(state: FireflyState, _dt: number): FireflyState {
	const fitnessFn = getFitnessFunction(state.params.functionIndex);
	const n = state.fireflies.length;
	const newPositions = state.fireflies.map((f) => ({ ...f.position }));

	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			if (i === j) continue;
			if (state.fireflies[j].brightness <= state.fireflies[i].brightness) continue;

			const dx = state.fireflies[j].position.x - state.fireflies[i].position.x;
			const dy = state.fireflies[j].position.y - state.fireflies[i].position.y;
			const distSq = dx * dx + dy * dy;

			newPositions[i] = moveToward(
				newPositions[i],
				state.fireflies[j].position,
				distSq,
				state.params,
			);
		}
	}

	const updatedFireflies = recalculateBrightness(newPositions, fitnessFn);
	const best = findGlobalBest(updatedFireflies, fitnessFn);
	const globalBestPosition =
		best.globalBestValue < state.globalBestValue
			? best.globalBestPosition
			: state.globalBestPosition;
	const globalBestValue = Math.min(best.globalBestValue, state.globalBestValue);

	return { ...state, fireflies: updatedFireflies, globalBestPosition, globalBestValue };
}

/**
 * Recalculates brightness for all fireflies after position updates.
 * Clamps positions to search bounds and computes brightness as 1 / (1 + fitness).
 * @param positions - array of new positions (mutable Vec2 objects)
 * @param fitnessFn - fitness function to evaluate
 * @returns array of fireflies with updated positions and brightness values
 */
function recalculateBrightness(
	positions: Vec2[],
	fitnessFn: (x: number, y: number) => number,
): Firefly[] {
	return positions.map((pos) => {
		const clamped = clampPosition(pos);
		const fitness = fitnessFn(clamped.x, clamped.y);
		return { position: clamped, brightness: 1 / (1 + fitness) };
	});
}

/**
 * Updates simulation parameters. Re-creates fireflies if count changed.
 * @param state - current state
 * @param params - new parameters
 * @returns state with updated params
 */
export function updateParams(state: FireflyState, params: FireflyParams): FireflyState {
	if (params.fireflyCount !== state.params.fireflyCount) {
		return createSimulation(params);
	}
	return { ...state, params };
}

/**
 * Resets all fireflies to new random positions while keeping params.
 * @param state - current state
 * @returns state with freshly initialized fireflies
 */
export function resetFireflies(state: FireflyState): FireflyState {
	return createSimulation(state.params);
}

/**
 * Switches the active fitness function and resets the simulation.
 * @param state - current state
 * @param functionIndex - new fitness function index
 * @returns fresh state with new function and recomputed heatmap
 */
export function setFunction(state: FireflyState, functionIndex: number): FireflyState {
	return createSimulation({ ...state.params, functionIndex });
}
