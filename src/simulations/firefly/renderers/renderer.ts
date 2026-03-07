import type { FireflyState } from '../types';
import { HEATMAP_COLS, HEATMAP_ROWS } from '../config';
import { clearCanvas, drawHeatmap } from '../../../rendering/shared';
import { renderFireflies, renderAttractionLines, renderGlobalBest } from './glow-renderer';

/** Context object holding the canvas and 2D rendering context */
export interface FireflyRendererContext {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
}

/**
 * Initializes the firefly renderer by acquiring the 2D context and setting up DPI scaling.
 * @param canvas - the HTML canvas element
 * @returns renderer context for drawing
 */
export function createRenderer(canvas: HTMLCanvasElement): FireflyRendererContext {
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Failed to get 2D rendering context');

	const dpr = window.devicePixelRatio || 1;
	canvas.width = canvas.clientWidth * dpr;
	canvas.height = canvas.clientHeight * dpr;
	ctx.scale(dpr, dpr);

	return { canvas, ctx };
}

/**
 * Maps a normalized fitness value [0, 1] to a very dim RGBA color for the contour background.
 * Uses cool blue-purple tones at low opacity to create a subtle landscape contour.
 * @param value - normalized value in [0, 1]
 * @returns rgba color string
 */
function contourColorFn(value: number): string {
	const r = Math.floor(value * 60 + 10);
	const g = Math.floor(value * 30 + 5);
	const b = Math.floor((1 - value) * 80 + 30);
	return `rgba(${r}, ${g}, ${b}, 0.15)`;
}

/**
 * Renders a complete Firefly Algorithm frame: clears canvas with dark background,
 * draws dim fitness landscape contour, attraction lines, firefly glows, and best marker.
 * @param renderer - renderer context
 * @param state - current Firefly simulation state
 * @param time - elapsed time in seconds for animations
 */
export function render(renderer: FireflyRendererContext, state: FireflyState, time: number): void {
	const { ctx, canvas } = renderer;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;

	clearCanvas(ctx, width, height, '#050510');
	drawHeatmap(ctx, state.heatmapData, HEATMAP_COLS, HEATMAP_ROWS, width, height, contourColorFn);
	renderAttractionLines(ctx, state.fireflies, width, height);
	renderFireflies(ctx, state.fireflies, width, height);
	renderGlobalBest(ctx, state.globalBestPosition, width, height, time);
}
