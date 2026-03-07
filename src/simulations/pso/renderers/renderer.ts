import type { PsoState } from '../types';
import { clearCanvas } from '../../../rendering/shared';
import { renderLandscape } from './landscape-renderer';
import { renderParticles, renderGlobalBest } from './particle-renderer';

/** Context object holding the canvas and 2D rendering context */
export interface PsoRendererContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

/**
 * Initializes the PSO renderer by acquiring the 2D context and setting up DPI scaling.
 * @param canvas - the HTML canvas element
 * @returns renderer context for drawing
 */
export function createRenderer(canvas: HTMLCanvasElement): PsoRendererContext {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D rendering context');

  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.scale(dpr, dpr);

  return { canvas, ctx };
}

/**
 * Renders a complete PSO frame: clears canvas, draws fitness landscape,
 * particles with personal best links, and the global best marker.
 * @param renderer - renderer context
 * @param state - current PSO simulation state
 * @param time - elapsed time in seconds for animations
 */
export function render(renderer: PsoRendererContext, state: PsoState, time: number): void {
  const { ctx, canvas } = renderer;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  clearCanvas(ctx, width, height);
  renderLandscape(ctx, state.heatmapData, width, height);
  renderParticles(ctx, state.particles, width, height);
  renderGlobalBest(ctx, state.globalBestPosition, width, height, time);
}
