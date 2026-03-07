import { register } from '../registry';
import type { SimulationInstance } from '../types';
import type { AcoParams } from './types';
import { DEFAULT_PARAMS } from './config';
import { createSimulation, tick, updateParams, resetAnts } from './simulation';
import { createRenderer, render } from './renderers/renderer';
import { buildPanel, type PanelControls } from '../../ui/panel-builder';
import { createLoop } from '../../loop';

/** Panel configuration for the ACO simulation */
const ACO_PANEL_CONFIG = {
  title: 'Ant Colony Optimization',
  description: 'Ants find shortest paths between nest and food via pheromone trails.',
  sliders: [
    { section: 'Pheromone', key: 'evaporationRate', label: 'Evaporation', min: 0.001, max: 0.1, step: 0.001, decimals: 3 },
    { key: 'pheromoneStrength', label: 'Strength', min: 0.5, max: 10, step: 0.5, decimals: 1 },
    { section: 'Behavior', key: 'explorationBias', label: 'Exploration', min: 0.01, max: 0.5, step: 0.01, decimals: 2 },
    { key: 'antSpeed', label: 'Speed', min: 1, max: 10, step: 0.5, decimals: 1 },
    { section: 'Colony', key: 'antCount', label: 'Ants', min: 10, max: 200, step: 1, decimals: 0 },
  ],
  info: '<code>P(cell) ~ pheromone(cell)^alpha</code><br/>Ants deposit pheromones on return trips. Shorter paths accumulate more pheromone.<br/>Marco Dorigo, 1992',
};

/**
 * Builds the ACO control panel using the generic panel builder.
 * @param panel - DOM element to render controls into
 * @param params - initial simulation parameters
 * @param callbacks - event handlers for parameter changes, pause, and reset
 * @returns panel controls including pause button
 */
function buildAcoPanel(
  panel: HTMLElement,
  params: AcoParams,
  callbacks: {
    onParamsChange: (params: AcoParams) => void;
    onPause: () => void;
    onReset: () => void;
  }
): PanelControls {
  return buildPanel(
    panel,
    ACO_PANEL_CONFIG,
    params as unknown as Record<string, number>,
    {
      onParamsChange: (p) => callbacks.onParamsChange(p as unknown as AcoParams),
      onPause: callbacks.onPause,
      onReset: callbacks.onReset,
    }
  );
}

/**
 * Creates an ACO simulation instance bound to the given canvas and panel.
 * Handles the animation loop, control panel, and resize events.
 * @param canvas - the canvas element for rendering
 * @param panel - the side panel element for controls
 * @returns a controllable simulation instance
 */
function createAcoSimulation(
  canvas: HTMLCanvasElement,
  panel: HTMLElement
): SimulationInstance {
  const renderer = createRenderer(canvas);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  let state = createSimulation(DEFAULT_PARAMS, width, height);

  const loop = createLoop(
    () => {
      const steps = Math.max(1, Math.round(state.params.antSpeed));
      for (let i = 0; i < steps; i++) {
        state = tick(state);
      }
    },
    () => { render(renderer, state); }
  );

  const { pauseBtn } = buildAcoPanel(panel, DEFAULT_PARAMS, {
    onParamsChange: (newParams: AcoParams) => { state = updateParams(state, newParams); },
    onPause: () => {
      loop.toggle();
      pauseBtn.textContent = loop.isRunning() ? 'Pause' : 'Resume';
    },
    onReset: () => { state = resetAnts(state); },
  });

  const handleResize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    renderer.ctx.setTransform(1, 0, 0, 1, 0, 0);
    renderer.ctx.scale(dpr, dpr);
  };
  window.addEventListener('resize', handleResize);

  return {
    start: () => loop.start(),
    stop: () => loop.stop(),
    destroy: () => {
      loop.stop();
      window.removeEventListener('resize', handleResize);
    },
  };
}

register({
  id: 'ant-colony',
  title: 'Ant Colony Optimization',
  description: 'Ants find shortest paths between nest and food source using pheromone trails. Inspired by the foraging behavior of real ants -- no central planner, just local chemical signals.',
  tags: ['swarm', 'optimization', 'pheromone', 'shortest-path'],
  create: createAcoSimulation,
});
