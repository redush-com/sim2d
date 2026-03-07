import type { ApfParams } from './types';
import { buildPanel, type PanelControls } from '../../ui/panel-builder';

/** Panel configuration for the APF simulation */
const APF_PANEL_CONFIG = {
  title: 'APF Swarm Simulation',
  description: 'Artificial Potential Fields for multi-agent path planning. Drag the goal or obstacles to interact.',
  sliders: [
    { section: 'Goal Attraction', key: 'kAtt', label: 'Pull strength', min: 0.1, max: 5, step: 0.1, decimals: 2 },
    { section: 'Obstacle Avoidance', key: 'kRep', label: 'Push strength', min: 1, max: 100, step: 1, decimals: 1 },
    { key: 'd0', label: 'Danger zone', min: 20, max: 250, step: 5, decimals: 0 },
    { section: 'Agent Spacing', key: 'kRepRobot', label: 'Repel strength', min: 1, max: 50, step: 1, decimals: 1 },
    { key: 'dRobot', label: 'Min distance', min: 10, max: 150, step: 5, decimals: 0 },
    { section: 'Swarm', key: 'agentCount', label: 'Agents', min: 1, max: 30, step: 1, decimals: 0 },
    { key: 'maxSpeed', label: 'Speed', min: 50, max: 500, step: 10, decimals: 0 },
    { key: 'trailLength', label: 'Trail', min: 10, max: 300, step: 10, decimals: 0 },
    { section: 'Stuck Escape', key: 'perturbStrength', label: 'Nudge force', min: 10, max: 200, step: 5, decimals: 0 },
  ],
  info: '<code>F = F_att + F_obs_rep + F_robot_rep</code><br/>Each agent follows the net force gradient.<br/>No communication. No central controller.',
};

/**
 * Builds the APF control panel using the generic panel builder.
 * @param panel - the DOM element to render controls into
 * @param params - initial simulation parameters
 * @param callbacks - event handlers for parameter changes, pause, and reset
 * @returns panel controls including pause button
 */
export function buildApfPanel(
  panel: HTMLElement,
  params: ApfParams,
  callbacks: {
    onParamsChange: (params: ApfParams) => void;
    onPause: () => void;
    onReset: () => void;
  }
): PanelControls {
  return buildPanel(
    panel,
    APF_PANEL_CONFIG,
    params as unknown as Record<string, number>,
    {
      onParamsChange: (p) => callbacks.onParamsChange(p as unknown as ApfParams),
      onPause: callbacks.onPause,
      onReset: callbacks.onReset,
    }
  );
}
