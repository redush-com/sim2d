import { register } from '../registry';
import type { SimulationInstance } from '../types';
import type { FireflyParams } from './types';
import { DEFAULT_PARAMS, FUNCTION_NAMES } from './config';
import { createSimulation, tick, updateParams, resetFireflies, setFunction } from './simulation';
import { createRenderer, render } from './renderers/renderer';
import { buildPanel, type PanelControls } from '../../ui/panel-builder';
import { createLoop } from '../../loop';
import { authStore } from '../../auth/auth-store';
import { saveSimulation } from '../../db/saved-simulations';
import { navigateTo } from '../../navigation';

/** Panel configuration for the Firefly Algorithm simulation */
const FIREFLY_PANEL_CONFIG = {
	title: 'Firefly Algorithm',
	description:
		'Fireflies move toward brighter neighbors. Brightness is determined by fitness — dimmer fireflies are attracted to brighter ones.',
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
			section: 'Attraction',
			key: 'attractiveness',
			label: 'Beta0',
			min: 0.1,
			max: 5,
			step: 0.1,
			decimals: 1,
		},
		{ key: 'lightAbsorption', label: 'Gamma', min: 0.01, max: 1, step: 0.01, decimals: 2 },
		{ key: 'randomness', label: 'Alpha', min: 0.01, max: 1, step: 0.01, decimals: 2 },
		{
			section: 'Swarm',
			key: 'fireflyCount',
			label: 'Fireflies',
			min: 5,
			max: 100,
			step: 1,
			decimals: 0,
		},
	],
	info: '<code>beta(r) = beta0 * exp(-gamma * r^2)</code><br/>Less bright fireflies move toward brighter ones. Brightness = fitness.<br/>Xin-She Yang, 2008',
};

/**
 * Builds the Firefly control panel with a function name label that updates
 * when the functionIndex slider changes.
 * @param panel - DOM element to render controls into
 * @param params - initial simulation parameters
 * @param callbacks - event handlers for parameter changes, pause, reset, and function change
 * @returns panel controls including pause button
 */
function buildFireflyPanel(
	panel: HTMLElement,
	params: FireflyParams,
	callbacks: {
		onParamsChange: (params: FireflyParams) => void;
		onPause: () => void;
		onReset: () => void;
		onFunctionChange: (index: number) => void;
		onSave?: () => void;
	},
): PanelControls {
	let currentParams = params;

	const controls = buildPanel(
		panel,
		FIREFLY_PANEL_CONFIG,
		currentParams as unknown as Record<string, number>,
		{
			onParamsChange: (p) => {
				const newParams = p as unknown as FireflyParams;
				const oldIndex = currentParams.functionIndex;
				currentParams = newParams;
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
	fnLabel.id = 'firefly-fn-label';
	fnLabel.style.cssText =
		'font-size:11px;color:#aaff44;margin-top:-4px;margin-bottom:8px;padding-left:2px;';
	fnLabel.textContent = `Active: ${FUNCTION_NAMES[currentParams.functionIndex]}`;

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
	const label = document.getElementById('firefly-fn-label');
	if (label) {
		label.textContent = `Active: ${FUNCTION_NAMES[index]}`;
	}
}

/**
 * Handles saving the current Firefly configuration to the database.
 * Redirects to login if the user is not authenticated.
 * @param getParams - function returning the current simulation parameters
 * @param saveBtn - the save button element to show feedback on (may be null)
 */
async function handleFireflySave(
	getParams: () => Record<string, number>,
	saveBtn: HTMLButtonElement | null,
): Promise<void> {
	if (!authStore.getState().user) {
		navigateTo('/login');
		return;
	}
	await saveSimulation({
		title: 'Firefly Algorithm',
		description: FIREFLY_PANEL_CONFIG.description,
		sim_type: 'builtin',
		builtin_id: 'firefly',
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
 * Creates a Firefly Algorithm simulation instance bound to the given canvas and panel.
 * @param canvas - the canvas element for rendering
 * @param panel - the side panel element for controls
 * @returns a controllable simulation instance
 */
function createFireflySimulation(
	canvas: HTMLCanvasElement,
	panel: HTMLElement,
): SimulationInstance {
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

	const { pauseBtn, saveBtn, getParams } = buildFireflyPanel(
		panel,
		{ ...DEFAULT_PARAMS },
		{
			onParamsChange: (newParams: FireflyParams) => {
				state = updateParams(state, newParams);
			},
			onPause: () => {
				loop.toggle();
				pauseBtn.textContent = loop.isRunning() ? 'Pause' : 'Resume';
			},
			onReset: () => {
				state = resetFireflies(state);
			},
			onFunctionChange: (index: number) => {
				state = setFunction(state, index);
			},
			onSave: () => {
				handleFireflySave(getParams, saveBtn);
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
	id: 'firefly',
	title: 'Firefly Algorithm',
	description:
		'Fireflies are attracted to brighter neighbors, with brightness determined by fitness. Less bright fireflies move toward brighter ones, converging on optimal solutions. Xin-She Yang, 2008.',
	tags: ['optimization', 'swarm', 'firefly', 'metaheuristic'],
	create: createFireflySimulation,
});
