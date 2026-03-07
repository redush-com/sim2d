import type { Ant } from '../types';

/**
 * Renders all ants as small colored dots on the canvas.
 * Searching ants are white; returning ants (carrying food) are orange.
 * @param ctx - canvas 2D rendering context
 * @param ants - array of ant states
 * @param cellSize - grid cell size in pixels
 */
export function renderAnts(
  ctx: CanvasRenderingContext2D,
  ants: Ant[],
  cellSize: number
): void {
  const radius = Math.max(cellSize * 0.35, 2);

  for (const ant of ants) {
    const px = ant.x * cellSize + cellSize / 2;
    const py = ant.y * cellSize + cellSize / 2;

    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fillStyle = ant.state === 'searching' ? '#ffffff' : '#ff8c00';
    ctx.fill();
  }
}
