import { register } from '../registry';
import type { SimulationInstance } from '../types';
import type { PsoParams } from './types';
import { DEFAULT_PARAMS, FUNCTION_NAMES } from './config';
import { createSimulation, tick, updateParams, resetParticles, setFunction } from './simulation';
import { createRenderer, render } from './renderers/renderer';
import { buildPanel, type PanelControls } from '../../ui/panel-builder';
import { createLoop } from '../../loop';
import { authStore } from '../../auth/auth-store';
import { saveSimulation } from '../../db/saved-simulations';
import { navigateTo } from '../../router';

/** Panel configuration for the PSO simulation */
const PSO_PANEL_CONFIG = {
	title: 'Particle Swarm Optimization',
	description:
		'Particles search for the global minimum of a fitness function using velocity updates inspired by social behavior.',
	sliders: [
		{
			section: 'Fitness Function',
			key: 'functionIndex',
			label: 'Function (0-3)',
			min: 0,
			max: 3,
			step: 1,
			decimals: 0,
		},
		{
			section: 'Velocity Weights',
			key: 'inertiaWeight',
			label: 'Inertia (w)',
			min: 0.1,
			max: 1.5,
			step: 0.05,
			decimals: 2,
		},
		{ key: 'cognitiveWeight', label: 'Cognitive (c1)', min: 0.1, max: 4, step: 0.1, decimals: 1 },
		{ key: 'socialWeight', label: 'Social (c2)', min: 0.1, max: 4, step: 0.1, decimals: 1 },
		{
			section: 'Swarm',
			key: 'particleCount',
			label: 'Particles',
			min: 5,
			max: 100,
			step: 1,
			decimals: 0,
		},
		{ key: 'maxSpeed', label: 'Max speed', min: 1, max: 20, step: 0.5, decimals: 1 },
	],
	info: '<code>v = w*v + c1*r1*(pBest-x) + c2*r2*(gBest-x)</code><br/>Particles search for the global minimum of a function.<br/>Kennedy &amp; Eberhart, 1995',
};

/**
 * Builds the PSO control panel. Includes a function name label that updates
 * when the functionIndex slider changes.
 * @param panel - DOM element to render controls into
 * @param params - initial simulation parameters
 * @param callbacks - event handlers for parameter changes, pause, reset, and function change
 * @returns panel controls including pause button
 */
function buildPsoPanel(
	panel: HTMLElement,
	params: PsoParams,
	callbacks: {
		onParamsChange: (params: PsoParams) => void;
		onPause: () => void;
		onReset: () => void;
		onFunctionChange: (index: number) => void;
		onSave?: () => void;
	},
): PanelControls {
	const controls = buildPanel(
		panel,
		PSO_PANEL_CONFIG,
		params as unknown as Record<string, number>,
		{
			onParamsChange: (p) => {
				const newParams = p as unknown as PsoParams;
				const oldIndex = params.functionIndex;
				params = newParams;
				if (newParams.functionIndex !== oldIndex) {
					updateFunctionLabel(newParams.functionIndex);
					callbacks.onFunctionChange(newParams.functionIndex);
				} else {
					callbacks.onParamsChange(newParams);
				}
			},
			onPause: callbacks.onPause,
			onReset: callbacks.onReset,
			onSave: callbacks.onSave,
		},
	);

	const fnLabel = document.createElement('div');
	fnLabel.id = 'pso-fn-label';
	fnLabel.style.cssText =
		'font-size:11px;color:#5588ff;margin-top:-4px;margin-bottom:8px;padding-left:2px;';
	fnLabel.textContent = `Active: ${FUNCTION_NAMES[params.functionIndex]}`;

	const firstSliderRow = panel.querySelector('.panel-param-row');
	if (firstSliderRow?.nextSibling) {
		panel.insertBefore(fnLabel, firstSliderRow.nextSibling);
	} else {
		panel.appendChild(fnLabel);
	}

	return controls;
}

/**
 * Updates the function name label in the panel.
 * @param index - new fitness function index
 */
function updateFunctionLabel(index: number): void {
	const label = document.getElementById('pso-fn-label');
	if (label) {
		label.textContent = `Active: ${FUNCTION_NAMES[index]}`;
	}
}

/**
 * Handles saving the current PSO configuration to the database.
 * Redirects to login if the user is not authenticated.
 * @param getParams - function returning the current simulation parameters
 * @param saveBtn - the save button element to show feedback on (may be null)
 */
async function handlePsoSave(
	getParams: () => Record<string, number>,
	saveBtn: HTMLButtonElement | null,
): Promise<void> {
	if (!authStore.getState().user) {
		navigateTo('/login');
		return;
	}
	await saveSimulation({
		title: 'Particle Swarm Optimization',
		description: PSO_PANEL_CONFIG.description,
		sim_type: 'builtin',
		builtin_id: 'pso',
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
 * Creates a PSO simulation instance bound to the given canvas and panel.
 * @param canvas - the canvas element for rendering
 * @param panel - the side panel element for controls
 * @returns a controllable simulation instance
 */
function createPsoSimulation(canvas: HTMLCanvasElement, panel: HTMLElement): SimulationInstance {
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

	const { pauseBtn, saveBtn, getParams } = buildPsoPanel(
		panel,
		{ ...DEFAULT_PARAMS },
		{
			onParamsChange: (newParams: PsoParams) => {
				state = updateParams(state, newParams);
			},
			onPause: () => {
				loop.toggle();
				pauseBtn.textContent = loop.isRunning() ? 'Pause' : 'Resume';
			},
			onReset: () => {
				state = resetParticles(state);
			},
			onFunctionChange: (index: number) => {
				state = setFunction(state, index);
			},
			onSave: () => {
				handlePsoSave(getParams, saveBtn);
			},
		},
	);

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
	id: 'pso',
	title: 'Particle Swarm Optimization',
	description:
		"A swarm of particles searches for the global minimum of a fitness landscape. Each particle tracks its personal best and the swarm's global best, converging via velocity updates. Kennedy & Eberhart, 1995.",
	tags: ['optimization', 'swarm', 'PSO', 'metaheuristic'],
	create: createPsoSimulation,
});
