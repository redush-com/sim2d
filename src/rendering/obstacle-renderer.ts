import type { Obstacle } from '../types';

/**
 * Renders all obstacles as solid circles with translucent influence-zone halos.
 * The halo shows the d0 repulsion radius so users can see the force field boundary.
 * @param ctx - canvas 2D rendering context
 * @param obstacles - array of obstacles to render
 * @param d0 - obstacle influence distance (shown as halo radius)
 */
export function renderObstacles(
  ctx: CanvasRenderingContext2D,
  obstacles: Obstacle[],
  d0: number
): void {
  for (const obs of obstacles) {
    // Influence halo
    ctx.beginPath();
    ctx.arc(obs.position.x, obs.position.y, obs.radius + d0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 60, 60, 0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 60, 60, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Obstacle body
    ctx.beginPath();
    ctx.arc(obs.position.x, obs.position.y, obs.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 80, 80, 0.7)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 120, 120, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
