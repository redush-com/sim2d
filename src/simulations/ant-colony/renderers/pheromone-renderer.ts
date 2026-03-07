import type { AcoState } from '../types';
import { drawHeatmap } from '../../../rendering/shared';

/**
 * Maps a normalized pheromone value to a green-channel RGBA color string.
 * Higher concentrations produce brighter green.
 * @param value - pheromone intensity in [0, 1] range
 * @returns RGBA color string
 */
function pheromoneColor(value: number): string {
  const g = Math.min(Math.floor(value * 255), 255);
  return `rgba(0, ${g}, 0, ${Math.min(value * 0.8 + 0.1, 0.9)})`;
}

/**
 * Normalizes the raw pheromone grid to [0, 1] range for heatmap rendering.
 * @param pheromones - raw pheromone Float32Array
 * @returns array of normalized values
 */
function normalizePheromones(pheromones: Float32Array): number[] {
  let max = 0;
  for (let i = 0; i < pheromones.length; i++) {
    if (pheromones[i] > max) max = pheromones[i];
  }

  if (max <= 0) return Array.from(pheromones);

  const normalized = new Array<number>(pheromones.length);
  for (let i = 0; i < pheromones.length; i++) {
    normalized[i] = pheromones[i] / max;
  }
  return normalized;
}

/**
 * Renders the pheromone concentration as a green heatmap overlay.
 * @param ctx - canvas 2D rendering context
 * @param state - current simulation state
 * @param width - canvas width in CSS pixels
 * @param height - canvas height in CSS pixels
 */
export function renderPheromones(
  ctx: CanvasRenderingContext2D,
  state: AcoState,
  width: number,
  height: number
): void {
  const data = normalizePheromones(state.pheromones);
  drawHeatmap(ctx, data, state.cols, state.rows, width, height, pheromoneColor);
}
