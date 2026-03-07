import type { AcoState } from '../types';
import { clearCanvas } from '../../../rendering/shared';
import { renderPheromones } from './pheromone-renderer';
import { renderAnts } from './ant-renderer';

/** Context object holding the canvas and 2D rendering context */
export interface AcoRendererContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

/**
 * Initializes the ACO renderer by acquiring the 2D context and setting up DPI scaling.
 * @param canvas - the HTML canvas element
 * @returns renderer context for drawing
 */
export function createRenderer(canvas: HTMLCanvasElement): AcoRendererContext {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D rendering context');

  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.scale(dpr, dpr);

  return { canvas, ctx };
}

/**
 * Renders the nest as a blue circle at its grid position.
 * @param ctx - canvas 2D rendering context
 * @param nest - nest grid coordinates
 * @param cellSize - grid cell size in pixels
 */
function renderNest(
  ctx: CanvasRenderingContext2D,
  nest: { x: number; y: number },
  cellSize: number
): void {
  const px = nest.x * cellSize + cellSize / 2;
  const py = nest.y * cellSize + cellSize / 2;
  const radius = cellSize * 2;

  ctx.beginPath();
  ctx.arc(px, py, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(60, 120, 255, 0.6)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(px, py, radius, 0, Math.PI * 2);
  ctx.strokeStyle = '#5588ff';
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Renders the food source as an orange circle at its grid position.
 * @param ctx - canvas 2D rendering context
 * @param food - food grid coordinates
 * @param cellSize - grid cell size in pixels
 */
function renderFood(
  ctx: CanvasRenderingContext2D,
  food: { x: number; y: number },
  cellSize: number
): void {
  const px = food.x * cellSize + cellSize / 2;
  const py = food.y * cellSize + cellSize / 2;
  const radius = cellSize * 2;

  ctx.beginPath();
  ctx.arc(px, py, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 140, 0, 0.6)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(px, py, radius, 0, Math.PI * 2);
  ctx.strokeStyle = '#ff8c00';
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Renders a complete frame: clears canvas, draws pheromones, nest, food, and ants.
 * @param renderer - renderer context
 * @param state - current simulation state
 */
export function render(renderer: AcoRendererContext, state: AcoState): void {
  const { ctx, canvas } = renderer;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  clearCanvas(ctx, width, height);
  renderPheromones(ctx, state, width, height);
  renderNest(ctx, state.nest, state.cellSize);
  renderFood(ctx, state.food, state.cellSize);
  renderAnts(ctx, state.ants, state.cellSize);
}
