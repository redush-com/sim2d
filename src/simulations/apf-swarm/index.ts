import { register } from '../registry';
import type { SimulationInstance } from '../types';
import type { ApfParams } from './types';
import { DEFAULT_PARAMS } from './config';
import {
	createSimulation,
	tick,
	setGoalPosition,
	setObstaclePosition,
	updateParams,
	resetAgents,
} from './simulation';
import { createRenderer, render } from './renderers/renderer';
import { buildApfPanel } from './panel';
import { initInteraction } from '../../ui/interaction';
import { createLoop } from '../../loop';
import { authStore } from '../../auth/auth-store';
import { saveSimulation } from '../../db/saved-simulations';
import { navigateTo } from '../../router';

/**
 * Handles saving the current APF configuration to the database.
 * Redirects to login if the user is not authenticated.
 * @param getParams - function returning the current simulation parameters
 * @param saveBtn - the save button element to show feedback on (may be null)
 */
async function handleApfSave(
	getParams: () => Record<string, number>,
	saveBtn: HTMLButtonElement | null,
): Promise<void> {
	if (!authStore.getState().user) {
		navigateTo('/login');
		return;
	}
	await saveSimulation({
		title: 'Artificial Potential Fields',
		description: 'Artificial Potential Fields for multi-agent path planning.',
		sim_type: 'builtin',
		builtin_id: 'apf-swarm',
		params: getParams(),
		source_code: undefined,
	});
	if (saveBtn) {
		saveBtn.textContent = 'Saved!';
		setTimeout(() => {
			saveBtn.textContent = 'Save Configuration';
		}, 1500);
	}
}

/**
 * Creates an APF swarm simulation instance bound to the given canvas and panel.
 * @param canvas - the canvas element for rendering
 * @param panel - the side panel element for controls
 * @returns a controllable simulation instance
 */
function createApfSimulation(canvas: HTMLCanvasElement, panel: HTMLElement): SimulationInstance {
	const renderer = createRenderer(canvas);
	let state = createSimulation(DEFAULT_PARAMS);

	const loop = createLoop(
		(dt) => {
			state = tick(state, dt);
		},
		(time) => {
			render(renderer, state, time);
		},
	);

	const { pauseBtn, saveBtn, getParams } = buildApfPanel(panel, DEFAULT_PARAMS, {
		onParamsChange: (newParams: ApfParams) => {
			state = updateParams(state, newParams);
		},
		onPause: () => {
			loop.toggle();
			pauseBtn.textContent = loop.isRunning() ? 'Pause' : 'Resume';
		},
		onReset: () => {
			state = resetAgents(state);
		},
		onSave: () => {
			handleApfSave(getParams, saveBtn);
		},
	});

	initInteraction(canvas, () => state, {
		onGoalMoved: (pos) => {
			state = setGoalPosition(state, pos);
		},
		onObstacleMoved: (index, pos) => {
			state = setObstaclePosition(state, index, pos);
		},
	});

	const handleResize = (): void => {
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
	id: 'apf-swarm',
	title: 'Artificial Potential Fields',
	description:
		'10 autonomous agents navigate toward a shared goal, avoid obstacles, and maintain spacing using only local force calculations. No communication, no central controller -- just physics-inspired math.',
	tags: ['swarm', 'path-planning', 'potential-fields', 'emergent-behavior'],
	create: createApfSimulation,
});
