import type { Vec2 } from '../types';
import * as vec from '../math/vector';

/** Callbacks for drag interactions */
export interface InteractionCallbacks {
  onGoalMoved: (position: Vec2) => void;
  onObstacleMoved: (index: number, position: Vec2) => void;
}

/** Obstacle shape for hit-testing */
interface HitTestObstacle {
  position: Vec2;
  radius: number;
}

/** State provider for hit-testing */
interface InteractionState {
  goalPosition: Vec2;
  obstacles: HitTestObstacle[];
}

/** Internal drag state */
interface DragState {
  active: boolean;
  target: 'goal' | 'obstacle';
  obstacleIndex: number;
}

/**
 * Converts a mouse event to canvas-local coordinates accounting for element offset.
 * @param canvas - the canvas element
 * @param event - the mouse event
 * @returns position in canvas coordinate space
 */
function getCanvasPosition(canvas: HTMLCanvasElement, event: MouseEvent): Vec2 {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

/**
 * Hit-tests whether a click position is within grab range of the goal.
 * @param pos - click position
 * @param goalPos - goal position
 * @returns true if within 20px
 */
function hitTestGoal(pos: Vec2, goalPos: Vec2): boolean {
  return vec.distance(pos, goalPos) < 20;
}

/**
 * Hit-tests obstacles and returns the index of the first hit, or -1.
 * @param pos - click position
 * @param obstacles - array of obstacles
 * @returns index of hit obstacle, or -1
 */
function hitTestObstacles(pos: Vec2, obstacles: HitTestObstacle[]): number {
  for (let i = 0; i < obstacles.length; i++) {
    if (vec.distance(pos, obstacles[i].position) < obstacles[i].radius + 15) {
      return i;
    }
  }
  return -1;
}

/**
 * Initializes mouse drag interaction on the canvas for moving goal and obstacles.
 * @param canvas - the canvas element to attach listeners to
 * @param getState - function returning current state for hit-testing
 * @param callbacks - handlers called when goal or obstacle is dragged
 */
export function initInteraction(
  canvas: HTMLCanvasElement,
  getState: () => InteractionState,
  callbacks: InteractionCallbacks
): void {
  const drag: DragState = { active: false, target: 'goal', obstacleIndex: -1 };

  canvas.addEventListener('mousedown', (e) => {
    const pos = getCanvasPosition(canvas, e);
    const state = getState();

    if (hitTestGoal(pos, state.goalPosition)) {
      drag.active = true;
      drag.target = 'goal';
      canvas.style.cursor = 'grabbing';
      return;
    }

    const obsIndex = hitTestObstacles(pos, state.obstacles);
    if (obsIndex >= 0) {
      drag.active = true;
      drag.target = 'obstacle';
      drag.obstacleIndex = obsIndex;
      canvas.style.cursor = 'grabbing';
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!drag.active) {
      const pos = getCanvasPosition(canvas, e);
      const state = getState();
      const overGoal = hitTestGoal(pos, state.goalPosition);
      const overObs = hitTestObstacles(pos, state.obstacles) >= 0;
      canvas.style.cursor = overGoal || overObs ? 'grab' : 'default';
      return;
    }

    const pos = getCanvasPosition(canvas, e);
    if (drag.target === 'goal') {
      callbacks.onGoalMoved(pos);
    } else {
      callbacks.onObstacleMoved(drag.obstacleIndex, pos);
    }
  });

  const endDrag = () => {
    drag.active = false;
    canvas.style.cursor = 'default';
  };

  canvas.addEventListener('mouseup', endDrag);
  canvas.addEventListener('mouseleave', endDrag);
}
