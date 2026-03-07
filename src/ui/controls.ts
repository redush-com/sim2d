import type { SimulationParams } from '../types';

/** Mapping of slider IDs to their SimulationParams keys */
const SLIDER_MAP: { id: string; key: keyof SimulationParams; decimals: number }[] = [
  { id: 'kAtt', key: 'kAtt', decimals: 2 },
  { id: 'kRep', key: 'kRep', decimals: 1 },
  { id: 'kRepRobot', key: 'kRepRobot', decimals: 1 },
  { id: 'd0', key: 'd0', decimals: 0 },
  { id: 'dRobot', key: 'dRobot', decimals: 0 },
  { id: 'agentCount', key: 'agentCount', decimals: 0 },
  { id: 'maxSpeed', key: 'maxSpeed', decimals: 0 },
  { id: 'trailLength', key: 'trailLength', decimals: 0 },
  { id: 'perturbStrength', key: 'perturbStrength', decimals: 0 },
];

/**
 * Initializes control panel sliders by binding them to simulation parameters.
 * Each slider updates the corresponding param and calls onChange with the full params object.
 * @param params - initial simulation parameters to sync slider values
 * @param onChange - callback fired when any parameter changes
 */
export function initControls(
  params: SimulationParams,
  onChange: (params: SimulationParams) => void
): void {
  const currentParams = { ...params };

  for (const { id, key, decimals } of SLIDER_MAP) {
    const slider = document.getElementById(`slider-${id}`) as HTMLInputElement | null;
    const valueDisplay = document.getElementById(`value-${id}`);

    if (!slider || !valueDisplay) continue;

    slider.value = String(currentParams[key]);
    valueDisplay.textContent = Number(currentParams[key]).toFixed(decimals);

    slider.addEventListener('input', () => {
      const val = parseFloat(slider.value);
      (currentParams as Record<string, number>)[key] = val;
      valueDisplay.textContent = val.toFixed(decimals);
      onChange({ ...currentParams });
    });
  }
}

/**
 * Syncs slider UI elements to reflect the given parameter values.
 * Used when params change programmatically (e.g., reset).
 * @param params - parameters to display
 */
export function updateControlValues(params: SimulationParams): void {
  for (const { id, key, decimals } of SLIDER_MAP) {
    const slider = document.getElementById(`slider-${id}`) as HTMLInputElement | null;
    const valueDisplay = document.getElementById(`value-${id}`);

    if (!slider || !valueDisplay) continue;

    slider.value = String(params[key]);
    valueDisplay.textContent = Number(params[key]).toFixed(decimals);
  }
}
