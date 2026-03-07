import type { ApfSimulationState } from '../types';
import { renderGoal } from './goal-renderer';
import { renderObstacles } from './obstacle-renderer';
import { renderAgents } from './agent-renderer';
import { clearCanvas, drawGrid } from '../../../rendering/shared';

/** Context object holding the canvas and 2D rendering context */
export interface RendererContext {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
}

/**
 * Initializes the renderer by acquiring the 2D context and setting up DPI scaling.
 * @param canvas - the HTML canvas element
 * @returns renderer context for drawing
 */
export function createRenderer(canvas: HTMLCanvasElement): RendererContext {
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Failed to get 2D rendering context');

	const dpr = window.devicePixelRatio || 1;
	canvas.width = canvas.clientWidth * dpr;
	canvas.height = canvas.clientHeight * dpr;
	ctx.scale(dpr, dpr);

	return { canvas, ctx };
}

/**
 * Renders a complete frame: clears the canvas, then draws goal, obstacles, and agents.
 * @param renderer - renderer context
 * @param state - current simulation state
 * @param time - elapsed time in seconds for animations
 */
export function render(renderer: RendererContext, state: ApfSimulationState, time: number): void {
	const { ctx, canvas } = renderer;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;

	clearCanvas(ctx, width, height);
	drawGrid(ctx, width, height);

	renderGoal(ctx, state.goalPosition, time);
	renderObstacles(ctx, state.obstacles, state.params.d0);
	renderAgents(ctx, state.agents);
}
