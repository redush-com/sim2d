import { HEATMAP_COLS, HEATMAP_ROWS } from '../config';
import { drawHeatmap } from '../../../rendering/shared';

/**
 * Maps a normalized fitness value [0, 1] to an RGBA color string.
 * Low values (good fitness) appear dark blue/purple; high values appear bright yellow/orange.
 * @param value - normalized value in [0, 1]
 * @returns rgba color string
 */
function fitnessColorFn(value: number): string {
	const r = Math.floor(value * 200 + 30);
	const g = Math.floor(value * 80 + 10);
	const b = Math.floor((1 - value) * 180 + 40);
	const a = 0.6 + value * 0.3;
	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Renders the fitness landscape as a heatmap onto the canvas.
 * Uses the pre-computed normalized heatmap data from the simulation state.
 * @param ctx - canvas 2D rendering context
 * @param heatmapData - flat row-major array of normalized fitness values
 * @param width - canvas width in CSS pixels
 * @param height - canvas height in CSS pixels
 */
export function renderLandscape(
	ctx: CanvasRenderingContext2D,
	heatmapData: number[],
	width: number,
	height: number,
): void {
	drawHeatmap(ctx, heatmapData, HEATMAP_COLS, HEATMAP_ROWS, width, height, fitnessColorFn);
}
