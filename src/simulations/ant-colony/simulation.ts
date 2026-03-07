import type { Ant, AcoParams, AcoState } from './types';
import { CELL_SIZE, PHEROMONE_ALPHA, NEST_OFFSET, FOOD_OFFSET } from './config';
import { createPheromoneGrid, evaporate, deposit, getPheromone } from './pheromones';

/**
 * Creates a fresh ACO simulation state sized to the given canvas dimensions.
 * @param params - simulation parameters
 * @param canvasWidth - canvas width in CSS pixels
 * @param canvasHeight - canvas height in CSS pixels
 * @returns initial simulation state
 */
export function createSimulation(
	params: AcoParams,
	canvasWidth: number,
	canvasHeight: number,
): AcoState {
	const cols = Math.floor(canvasWidth / CELL_SIZE);
	const rows = Math.floor(canvasHeight / CELL_SIZE);
	const nest = { x: NEST_OFFSET, y: NEST_OFFSET };
	const food = { x: cols - FOOD_OFFSET - 1, y: rows - FOOD_OFFSET - 1 };

	return {
		ants: spawnAnts(params.antCount, nest),
		pheromones: createPheromoneGrid(cols, rows),
		cols,
		rows,
		cellSize: CELL_SIZE,
		nest,
		food,
		params,
	};
}

/**
 * Creates an array of ants starting at the nest position.
 * @param count - number of ants to spawn
 * @param nest - nest grid coordinates
 * @returns array of ants in 'searching' state
 */
function spawnAnts(count: number, nest: { x: number; y: number }): Ant[] {
	return Array.from({ length: count }, () => ({
		x: nest.x,
		y: nest.y,
		state: 'searching' as const,
		pathLength: 0,
	}));
}

/**
 * Advances the simulation by one tick: evaporates pheromones and updates all ants.
 * @param state - current simulation state
 * @returns updated simulation state (pheromone grid is mutated in place)
 */
export function tick(state: AcoState): AcoState {
	evaporate(state.pheromones, state.params.evaporationRate);

	const updatedAnts = state.ants.map((ant) => updateAnt(ant, state));

	return { ...state, ants: updatedAnts };
}

/**
 * Updates a single ant: moves it, checks for food/nest arrival, and deposits pheromone.
 * @param ant - ant to update
 * @param state - current simulation state
 * @returns updated ant
 */
function updateAnt(ant: Ant, state: AcoState): Ant {
	const { cols, nest, food, params, pheromones } = state;
	const next = chooseNextCell(ant, state);

	let updatedAnt: Ant = {
		...ant,
		x: next.x,
		y: next.y,
		pathLength: ant.pathLength + 1,
	};

	if (updatedAnt.state === 'returning') {
		deposit(pheromones, cols, next.x, next.y, params.pheromoneStrength, updatedAnt.pathLength);
	}

	updatedAnt = checkArrival(updatedAnt, nest, food);
	return updatedAnt;
}

/**
 * Checks if an ant has arrived at its target (food or nest) and toggles state.
 * @param ant - ant to check
 * @param nest - nest grid coordinates
 * @param food - food grid coordinates
 * @returns ant with potentially toggled state
 */
function checkArrival(
	ant: Ant,
	nest: { x: number; y: number },
	food: { x: number; y: number },
): Ant {
	const arrivalRadius = 2;

	if (ant.state === 'searching') {
		const dx = ant.x - food.x;
		const dy = ant.y - food.y;
		if (dx * dx + dy * dy <= arrivalRadius * arrivalRadius) {
			return { ...ant, state: 'returning', pathLength: 0 };
		}
	} else {
		const dx = ant.x - nest.x;
		const dy = ant.y - nest.y;
		if (dx * dx + dy * dy <= arrivalRadius * arrivalRadius) {
			return { ...ant, state: 'searching', pathLength: 0 };
		}
	}

	return ant;
}

/**
 * Chooses the next grid cell for an ant based on pheromone concentration
 * and exploration bias. With probability explorationBias, a random neighbor
 * is chosen; otherwise, neighbors are weighted by pheromone^alpha.
 * @param ant - ant choosing its next cell
 * @param state - current simulation state
 * @returns grid coordinates of the chosen next cell
 */
function chooseNextCell(ant: Ant, state: AcoState): { x: number; y: number } {
	const { cols, rows, params, pheromones, food, nest } = state;
	const neighbors = getValidNeighbors(ant.x, ant.y, cols, rows);

	if (neighbors.length === 0) return { x: ant.x, y: ant.y };

	if (Math.random() < params.explorationBias) {
		return neighbors[Math.floor(Math.random() * neighbors.length)];
	}

	const target = ant.state === 'searching' ? food : nest;
	const weights = computeNeighborWeights(neighbors, pheromones, cols, rows, target);

	return selectWeighted(neighbors, weights);
}

/**
 * Returns all valid 8-connected neighbor cells within grid bounds.
 * @param x - current column
 * @param y - current row
 * @param cols - grid columns
 * @param rows - grid rows
 * @returns array of valid neighbor coordinates
 */
function getValidNeighbors(
	x: number,
	y: number,
	cols: number,
	rows: number,
): { x: number; y: number }[] {
	const neighbors: { x: number; y: number }[] = [];
	for (let dy = -1; dy <= 1; dy++) {
		for (let dx = -1; dx <= 1; dx++) {
			if (dx === 0 && dy === 0) continue;
			const nx = x + dx;
			const ny = y + dy;
			if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
				neighbors.push({ x: nx, y: ny });
			}
		}
	}
	return neighbors;
}

/**
 * Computes movement weights for neighbor cells using pheromone concentration
 * raised to alpha, plus a small directional bias toward the target.
 * @param neighbors - array of neighbor coordinates
 * @param pheromones - pheromone grid
 * @param cols - grid columns
 * @param rows - grid rows
 * @param target - target position (food or nest)
 * @returns array of weights corresponding to each neighbor
 */
function computeNeighborWeights(
	neighbors: { x: number; y: number }[],
	pheromones: Float32Array,
	cols: number,
	rows: number,
	target: { x: number; y: number },
): number[] {
	return neighbors.map((n) => {
		const phero = getPheromone(pheromones, cols, rows, n.x, n.y);
		const pheromoneWeight = Math.pow(phero + 0.01, PHEROMONE_ALPHA);

		const dx = target.x - n.x;
		const dy = target.y - n.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const directionBias = 1 / (dist + 1);

		return pheromoneWeight + directionBias * 0.1;
	});
}

/**
 * Selects a neighbor using roulette-wheel selection based on weights.
 * @param neighbors - candidate cells
 * @param weights - probability weights for each candidate
 * @returns the selected neighbor
 */
function selectWeighted(
	neighbors: { x: number; y: number }[],
	weights: number[],
): { x: number; y: number } {
	const total = weights.reduce((sum, w) => sum + w, 0);
	if (total <= 0) return neighbors[Math.floor(Math.random() * neighbors.length)];

	let r = Math.random() * total;
	for (let i = 0; i < neighbors.length; i++) {
		r -= weights[i];
		if (r <= 0) return neighbors[i];
	}
	return neighbors[neighbors.length - 1];
}

/**
 * Updates simulation parameters, re-spawning ants if count changed.
 * @param state - current state
 * @param params - new parameters
 * @returns state with updated params
 */
export function updateParams(state: AcoState, params: AcoParams): AcoState {
	if (params.antCount !== state.ants.length) {
		return {
			...state,
			params,
			ants: spawnAnts(params.antCount, state.nest),
		};
	}
	return { ...state, params };
}

/**
 * Resets all ants to the nest and clears the pheromone grid.
 * @param state - current state
 * @returns state with reset ants and pheromones
 */
export function resetAnts(state: AcoState): AcoState {
	return {
		...state,
		ants: spawnAnts(state.params.antCount, state.nest),
		pheromones: createPheromoneGrid(state.cols, state.rows),
	};
}
