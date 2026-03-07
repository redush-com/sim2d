import type { SimulationState } from '../types';
import { renderGoal } from './goal-renderer';
import { renderObstacles } from './obstacle-renderer';
import { renderAgents } from './agent-renderer';

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
export function render(renderer: RendererContext, state: SimulationState, time: number): void {
  const { ctx, canvas } = renderer;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  // Clear with dark background
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, width, height);

  // Draw subtle grid
  drawGrid(ctx, width, height);

  renderGoal(ctx, state.goalPosition, time);
  renderObstacles(ctx, state.obstacles, state.params.d0);
  renderAgents(ctx, state.agents);
}

/**
 * Draws a subtle grid for spatial reference.
 * @param ctx - canvas 2D rendering context
 * @param width - canvas width
 * @param height - canvas height
 */
function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const spacing = 50;

  for (let x = spacing; x < width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = spacing; y < height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}
