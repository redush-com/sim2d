import { DEFAULT_PARAMS } from './config';
import {
  createSimulation,
  tick,
  setGoalPosition,
  setObstaclePosition,
  updateParams,
  resetAgents,
} from './simulation/simulation-engine';
import { createRenderer, render } from './rendering/renderer';
import { initControls } from './ui/controls';
import { initInteraction } from './ui/interaction';
import { createLoop } from './loop';

/**
 * Bootstraps the APF swarm simulation by wiring together
 * the simulation engine, renderer, UI controls, and animation loop.
 */
function main(): void {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) throw new Error('Canvas element not found');

  const renderer = createRenderer(canvas);
  let state = createSimulation(DEFAULT_PARAMS);

  const loop = createLoop(
    (dt) => { state = tick(state, dt); },
    (time) => { render(renderer, state, time); }
  );

  initControls(DEFAULT_PARAMS, (newParams) => {
    state = updateParams(state, newParams);
  });

  initInteraction(canvas, () => state, {
    onGoalMoved: (pos) => { state = setGoalPosition(state, pos); },
    onObstacleMoved: (index, pos) => { state = setObstaclePosition(state, index, pos); },
  });

  const pauseBtn = document.getElementById('btn-pause');
  const resetBtn = document.getElementById('btn-reset');

  pauseBtn?.addEventListener('click', () => {
    loop.toggle();
    pauseBtn.textContent = loop.isRunning() ? 'Pause' : 'Resume';
  });

  resetBtn?.addEventListener('click', () => {
    state = resetAgents(state);
  });

  handleResize(canvas, renderer);
  loop.start();
}

/**
 * Handles window resize to keep canvas properly scaled.
 * @param canvas - canvas element
 * @param renderer - renderer context to update
 */
function handleResize(
  canvas: HTMLCanvasElement,
  renderer: { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }
): void {
  window.addEventListener('resize', () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    renderer.ctx.setTransform(1, 0, 0, 1, 0, 0);
    renderer.ctx.scale(dpr, dpr);
  });
}

main();
