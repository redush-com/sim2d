/** Configuration for a single slider control */
export interface SliderDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  decimals: number;
  section?: string;
}

/** Configuration for building a simulation control panel */
export interface PanelConfig {
  title: string;
  description: string;
  sliders: SliderDef[];
  info?: string;
}

/** Controls returned from the panel builder */
export interface PanelControls {
  pauseBtn: HTMLButtonElement;
  getParams: () => Record<string, number>;
}

/**
 * Builds a generic simulation control panel with sliders, buttons, and info.
 * @param panel - DOM element to render into
 * @param config - panel layout configuration
 * @param params - initial parameter values
 * @param callbacks - event handlers for param changes, pause, and reset
 * @returns panel controls including pause button reference
 */
export function buildPanel(
  panel: HTMLElement,
  config: PanelConfig,
  params: Record<string, number>,
  callbacks: {
    onParamsChange: (params: Record<string, number>) => void;
    onPause: () => void;
    onReset: () => void;
  }
): PanelControls {
  panel.innerHTML = '';
  addPanelStyles(panel);

  const currentParams = { ...params };

  const title = document.createElement('h1');
  title.className = 'panel-title';
  title.textContent = config.title;
  panel.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'panel-subtitle';
  subtitle.textContent = config.description;
  panel.appendChild(subtitle);

  for (const slider of config.sliders) {
    if (slider.section) {
      const label = document.createElement('div');
      label.className = 'panel-section-label';
      label.textContent = slider.section;
      panel.appendChild(label);
    }
    createSliderRow(panel, slider, currentParams, callbacks.onParamsChange);
  }

  const btnRow = document.createElement('div');
  btnRow.className = 'panel-btn-row';

  const pauseBtn = document.createElement('button');
  pauseBtn.textContent = 'Pause';
  pauseBtn.addEventListener('click', callbacks.onPause);

  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', callbacks.onReset);

  btnRow.appendChild(pauseBtn);
  btnRow.appendChild(resetBtn);
  panel.appendChild(btnRow);

  if (config.info) {
    const info = document.createElement('div');
    info.className = 'panel-info';
    info.innerHTML = config.info;
    panel.appendChild(info);
  }

  return {
    pauseBtn,
    getParams: () => ({ ...currentParams }),
  };
}

/**
 * Creates a slider row with label, range input, and value display.
 * @param panel - container element
 * @param config - slider configuration
 * @param params - mutable params object
 * @param onChange - callback when value changes
 */
function createSliderRow(
  panel: HTMLElement,
  config: SliderDef,
  params: Record<string, number>,
  onChange: (p: Record<string, number>) => void
): void {
  const row = document.createElement('div');
  row.className = 'panel-param-row';

  const label = document.createElement('label');
  label.textContent = config.label;

  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(config.min);
  input.max = String(config.max);
  input.step = String(config.step);
  input.value = String(params[config.key] ?? config.min);

  const value = document.createElement('span');
  value.className = 'panel-param-value';
  value.textContent = Number(params[config.key] ?? config.min).toFixed(config.decimals);

  input.addEventListener('input', () => {
    const val = parseFloat(input.value);
    params[config.key] = val;
    value.textContent = val.toFixed(config.decimals);
    onChange({ ...params });
  });

  row.appendChild(label);
  row.appendChild(input);
  row.appendChild(value);
  panel.appendChild(row);
}

/**
 * Adds scoped CSS styles for the panel.
 * @param panel - panel element to scope styles to
 */
function addPanelStyles(panel: HTMLElement): void {
  const style = document.createElement('style');
  style.textContent = `
    .panel-title { font-size: 15px; font-weight: 600; color: #e0e0e8; margin-bottom: 4px; }
    .panel-subtitle { font-size: 11px; color: #666; margin-bottom: 12px; line-height: 1.4; }
    .panel-section-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; color: #555; margin-top: 12px; margin-bottom: 6px; }
    .panel-param-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
    .panel-param-row label { font-size: 12px; color: #999; min-width: 80px; }
    .panel-param-row input[type="range"] { flex: 1; height: 4px; -webkit-appearance: none; appearance: none; background: #1e1e2a; border-radius: 2px; outline: none; }
    .panel-param-row input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #5588ff; cursor: pointer; }
    .panel-param-row input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: #5588ff; border: none; cursor: pointer; }
    .panel-param-value { font-size: 11px; color: #5588ff; min-width: 36px; text-align: right; font-variant-numeric: tabular-nums; }
    .panel-btn-row { display: flex; gap: 8px; margin-top: 12px; }
    .panel-btn-row button { flex: 1; padding: 8px 0; border: 1px solid #2a2a3a; border-radius: 6px; background: #14141e; color: #c0c0cc; font-size: 12px; font-weight: 500; cursor: pointer; transition: background 0.15s, border-color 0.15s; }
    .panel-btn-row button:hover { background: #1c1c2a; border-color: #3a3a50; }
    .panel-info { margin-top: auto; padding-top: 16px; border-top: 1px solid #1a1a24; font-size: 10px; color: #444; line-height: 1.5; }
    .panel-info code { color: #5588ff; font-size: 10px; }
  `;
  panel.appendChild(style);
}
