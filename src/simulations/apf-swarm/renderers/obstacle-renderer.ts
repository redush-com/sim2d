import type { Obstacle } from '../../../types';

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
    renderInfluenceGradient(ctx, obs, d0);
    renderObstacleBody(ctx, obs);
  }
}

/**
 * Draws a smooth radial gradient representing the repulsive influence field.
 * The gradient fades from visible near the obstacle to transparent at d0 boundary.
 * @param ctx - canvas 2D rendering context
 * @param obs - obstacle to render gradient for
 * @param d0 - influence distance threshold
 */
function renderInfluenceGradient(
  ctx: CanvasRenderingContext2D,
  obs: Obstacle,
  d0: number
): void {
  const outerRadius = obs.radius + d0;
  const gradient = ctx.createRadialGradient(
    obs.position.x, obs.position.y, obs.radius,
    obs.position.x, obs.position.y, outerRadius
  );
  gradient.addColorStop(0, 'rgba(255, 50, 30, 0.25)');
  gradient.addColorStop(0.3, 'rgba(255, 50, 30, 0.12)');
  gradient.addColorStop(0.7, 'rgba(255, 50, 30, 0.04)');
  gradient.addColorStop(1, 'rgba(255, 50, 30, 0)');

  ctx.beginPath();
  ctx.arc(obs.position.x, obs.position.y, outerRadius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

/**
 * Draws the solid obstacle body with a subtle glow border.
 * @param ctx - canvas 2D rendering context
 * @param obs - obstacle to render
 */
function renderObstacleBody(ctx: CanvasRenderingContext2D, obs: Obstacle): void {
  ctx.beginPath();
  ctx.arc(obs.position.x, obs.position.y, obs.radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 80, 80, 0.7)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 120, 120, 0.9)';
  ctx.lineWidth = 2;
  ctx.stroke();
}
