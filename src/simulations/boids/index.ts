import { register } from '../registry';
import type { SimulationInstance } from '../types';
import type { BoidParams } from './types';
import { DEFAULT_PARAMS } from './config';
import { createSimulation, tick, updateParams, resetAgents } from './simulation';
import { createRenderer, render } from './renderers/renderer';
import { buildPanel, type PanelControls } from '../../ui/panel-builder';
import { createLoop } from '../../loop';

/** Panel configuration for the Boids flocking simulation */
const BOIDS_PANEL_CONFIG = {
  title: 'Boids Flocking',
  description: 'Reynolds 1987 flocking model. Agents follow three local rules: separation, alignment, and cohesion.',
  sliders: [
    { section: 'Flocking Weights', key: 'separationWeight', label: 'Separation', min: 0.1, max: 5, step: 0.1, decimals: 1 },
    { key: 'alignmentWeight', label: 'Alignment', min: 0.1, max: 5, step: 0.1, decimals: 1 },
    { key: 'cohesionWeight', label: 'Cohesion', min: 0.1, max: 5, step: 0.1, decimals: 1 },
    { section: 'Perception', key: 'perceptionRadius', label: 'Radius', min: 20, max: 300, step: 5, decimals: 0 },
    { section: 'Motion', key: 'maxSpeed', label: 'Max speed', min: 50, max: 500, step: 10, decimals: 0 },
    { key: 'maxForce', label: 'Max force', min: 1, max: 50, step: 1, decimals: 0 },
    { section: 'Swarm', key: 'agentCount', label: 'Agents', min: 5, max: 200, step: 5, decimals: 0 },
  ],
  info: '<code>F = w_s*Separation + w_a*Alignment + w_c*Cohesion</code><br/>Three simple rules create complex flocking behavior.<br/>Craig Reynolds, 1987',
};

/**
 * Builds the Boids control panel using the generic panel builder.
 * @param panel - the DOM element to render controls into
 * @param params - initial simulation parameters
 * @param callbacks - event handlers for parameter changes, pause, and reset
 * @returns panel controls including pause button
 */
function buildBoidsPanel(
  panel: HTMLElement,
  params: BoidParams,
  callbacks: {
    onParamsChange: (params: BoidParams) => void;
    onPause: () => void;
    onReset: () => void;
  }
): PanelControls {
  return buildPanel(
    panel,
    BOIDS_PANEL_CONFIG,
    params as unknown as Record<string, number>,
    {
      onParamsChange: (p) => callbacks.onParamsChange(p as unknown as BoidParams),
      onPause: callbacks.onPause,
      onReset: callbacks.onReset,
    }
  );
}

/**
 * Creates a Boids flocking simulation instance bound to the given canvas and panel.
 * Sets up the simulation state, rendering loop, and control panel.
 * @param canvas - the canvas element for rendering
 * @param panel - the side panel element for controls
 * @returns a controllable simulation instance
 */
function createBoidsSimulation(
  canvas: HTMLCanvasElement,
  panel: HTMLElement
): SimulationInstance {
  const renderer = createRenderer(canvas);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  let state = createSimulation(DEFAULT_PARAMS, width, height);

  const loop = createLoop(
    (dt) => { state = tick(state, dt); },
    () => { render(renderer, state); }
  );

  const { pauseBtn } = buildBoidsPanel(panel, DEFAULT_PARAMS, {
    onParamsChange: (newParams: BoidParams) => { state = updateParams(state, newParams); },
    onPause: () => {
      loop.toggle();
      pauseBtn.textContent = loop.isRunning() ? 'Pause' : 'Resume';
    },
    onReset: () => { state = resetAgents(state); },
  });

  const handleResize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    renderer.ctx.setTransform(1, 0, 0, 1, 0, 0);
    renderer.ctx.scale(dpr, dpr);
    state = { ...state, width: canvas.clientWidth, height: canvas.clientHeight };
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
  id: 'boids',
  title: 'Boids Flocking',
  description: '50 autonomous agents flock using three simple rules: separation, alignment, and cohesion. No leader, no global plan -- just local interactions creating emergent group behavior.',
  tags: ['swarm', 'flocking', 'boids', 'emergent-behavior'],
  create: createBoidsSimulation,
});
