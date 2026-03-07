import type { Vec2 } from '../../types';
import type { Obstacle } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config';

/**
 * Creates a circular obstacle at the given position.
 * @param position - center of the obstacle
 * @param radius - radius of the obstacle
 * @returns a new Obstacle
 */
export function createObstacle(position: Vec2, radius: number): Obstacle {
  return { position, radius };
}

/**
 * Creates the 5 default obstacles positioned to create an interesting
 * navigation challenge between typical spawn area (left) and goal (right).
 * @returns array of 5 obstacles
 */
export function createDefaultObstacles(): Obstacle[] {
  const cx = CANVAS_WIDTH / 2;
  const cy = CANVAS_HEIGHT / 2;

  return [
    createObstacle({ x: cx - 100, y: cy }, 30),
    createObstacle({ x: cx + 80, y: cy - 120 }, 25),
    createObstacle({ x: cx + 80, y: cy + 120 }, 25),
    createObstacle({ x: cx - 200, y: cy - 150 }, 35),
    createObstacle({ x: cx + 200, y: cy + 80 }, 28),
  ];
}
