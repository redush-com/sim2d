import type { SimulationParams } from '../../types';

/** Slider configuration for building the control panel */
interface SliderConfig {
  id: string;
  key: keyof SimulationParams;
  label: string;
  min: number;
  max: number;
  step: number;
  decimals: number;
  section?: string;
}

const SLIDERS: SliderConfig[] = [
  { section: 'Goal Attraction', id: 'kAtt', key: 'kAtt', label: 'Pull strength', min: 0.1, max: 5, step: 0.1, decimals: 2 },
  { section: 'Obstacle Avoidance', id: 'kRep', key: 'kRep', label: 'Push strength', min: 1, max: 100, step: 1, decimals: 1 },
  { id: 'd0', key: 'd0', label: 'Danger zone', min: 20, max: 250, step: 5, decimals: 0 },
  { section: 'Agent Spacing', id: 'kRepRobot', key: 'kRepRobot', label: 'Repel strength', min: 1, max: 50, step: 1, decimals: 1 },
  { id: 'dRobot', key: 'dRobot', label: 'Min distance', min: 10, max: 150, step: 5, decimals: 0 },
  { section: 'Swarm', id: 'agentCount', key: 'agentCount', label: 'Agents', min: 1, max: 30, step: 1, decimals: 0 },
  { id: 'maxSpeed', key: 'maxSpeed', label: 'Speed', min: 50, max: 500, step: 10, decimals: 0 },
  { id: 'trailLength', key: 'trailLength', label: 'Trail', min: 10, max: 300, step: 10, decimals: 0 },
  { section: 'Stuck Escape', id: 'perturbStrength', key: 'perturbStrength', label: 'Nudge force', min: 10, max: 200, step: 5, decimals: 0 },
];

/**
 * Builds the APF control panel with sliders, buttons, and info section.
 * Returns callbacks for pause/reset and parameter changes.
 * @param panel - the DOM element to render controls into
 * @param params - initial simulation parameters
 * @param callbacks - event handlers for parameter changes, pause, and reset
 */
export function buildApfPanel(
  panel: HTMLElement,
  params: SimulationParams,
  callbacks: {
    onParamsChange: (params: SimulationParams) => void;
    onPause: () => void;
    onReset: () => void;
  }
): { pauseBtn: HTMLButtonElement } {
  panel.innerHTML = '';
  addPanelStyles(panel);

  const title = document.createElement('h1');
  title.className = 'apf-panel-title';
  title.textContent = 'APF Swarm Simulation';
  panel.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'apf-panel-subtitle';
  subtitle.textContent = 'Artificial Potential Fields for multi-agent path planning. Drag the goal or obstacles to interact.';
  panel.appendChild(subtitle);

  const currentParams = { ...params };

  for (const slider of SLIDERS) {
    if (slider.section) {
      const label = document.createElement('div');
      label.className = 'apf-section-label';
      label.textContent = slider.section;
      panel.appendChild(label);
    }
    createSliderRow(panel, slider, currentParams, callbacks.onParamsChange);
  }

  const btnRow = document.createElement('div');
  btnRow.className = 'apf-btn-row';

  const pauseBtn = document.createElement('button');
  pauseBtn.textContent = 'Pause';
  pauseBtn.addEventListener('click', callbacks.onPause);

  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', callbacks.onReset);

  btnRow.appendChild(pauseBtn);
  btnRow.appendChild(resetBtn);
  panel.appendChild(btnRow);

  const info = document.createElement('div');
  info.className = 'apf-info';
  info.innerHTML = '<code>F = F_att + F_obs_rep + F_robot_rep</code><br/>Each agent follows the net force gradient.<br/>No communication. No central controller.';
  panel.appendChild(info);

  return { pauseBtn };
}

/**
 * Creates a single slider row with label, range input, and value display.
 * @param panel - container element
 * @param config - slider configuration
 * @param params - mutable params object
 * @param onChange - callback when value changes
 */
function createSliderRow(
  panel: HTMLElement,
  config: SliderConfig,
  params: Record<string, number>,
  onChange: (p: SimulationParams) => void
): void {
  const row = document.createElement('div');
  row.className = 'apf-param-row';

  const label = document.createElement('label');
  label.textContent = config.label;

  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(config.min);
  input.max = String(config.max);
  input.step = String(config.step);
  input.value = String(params[config.key]);

  const value = document.createElement('span');
  value.className = 'apf-param-value';
  value.textContent = Number(params[config.key]).toFixed(config.decimals);

  input.addEventListener('input', () => {
    const val = parseFloat(input.value);
    params[config.key] = val;
    value.textContent = val.toFixed(config.decimals);
    onChange({ ...params } as unknown as SimulationParams);
  });

  row.appendChild(label);
  row.appendChild(input);
  row.appendChild(value);
  panel.appendChild(row);
}

/**
 * Adds scoped styles for the APF panel.
 * @param panel - the panel element
 */
function addPanelStyles(panel: HTMLElement): void {
  const style = document.createElement('style');
  style.textContent = `
    .apf-panel-title { font-size: 15px; font-weight: 600; color: #e0e0e8; margin-bottom: 4px; }
    .apf-panel-subtitle { font-size: 11px; color: #666; margin-bottom: 12px; line-height: 1.4; }
    .apf-section-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; color: #555; margin-top: 12px; margin-bottom: 6px; }
    .apf-param-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
    .apf-param-row label { font-size: 12px; color: #999; min-width: 80px; }
    .apf-param-row input[type="range"] { flex: 1; height: 4px; -webkit-appearance: none; appearance: none; background: #1e1e2a; border-radius: 2px; outline: none; }
    .apf-param-row input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #5588ff; cursor: pointer; }
    .apf-param-row input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: #5588ff; border: none; cursor: pointer; }
    .apf-param-value { font-size: 11px; color: #5588ff; min-width: 36px; text-align: right; font-variant-numeric: tabular-nums; }
    .apf-btn-row { display: flex; gap: 8px; margin-top: 12px; }
    .apf-btn-row button { flex: 1; padding: 8px 0; border: 1px solid #2a2a3a; border-radius: 6px; background: #14141e; color: #c0c0cc; font-size: 12px; font-weight: 500; cursor: pointer; transition: background 0.15s, border-color 0.15s; }
    .apf-btn-row button:hover { background: #1c1c2a; border-color: #3a3a50; }
    .apf-info { margin-top: auto; padding-top: 16px; border-top: 1px solid #1a1a24; font-size: 10px; color: #444; line-height: 1.5; }
    .apf-info code { color: #5588ff; font-size: 10px; }
  `;
  panel.appendChild(style);
}
