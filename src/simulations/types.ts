/** Optional saved configuration to restore when creating a simulation */
export interface SavedConfig {
	/** Parameter overrides for builtin simulations */
	params?: Record<string, number>;
	/** Saved source code for custom simulations */
	sourceCode?: string;
}

/**
 * Definition of a simulation that can be registered and selected from the main menu.
 * Each simulation is a self-contained module with its own rendering, controls, and logic.
 */
export interface SimulationDefinition {
	/** Unique identifier, e.g. 'apf-swarm' */
	id: string;
	/** Display title for the card */
	title: string;
	/** Short description shown on the card */
	description: string;
	/** Tags for categorization, e.g. ['swarm', 'path-planning'] */
	tags: string[];
	/**
	 * Factory that creates a running simulation instance.
	 * @param canvas - the canvas element for rendering
	 * @param panel - the side panel element for controls
	 * @param savedConfig - optional saved configuration to restore
	 * @returns a controllable simulation instance
	 */
	create: (
		canvas: HTMLCanvasElement,
		panel: HTMLElement,
		savedConfig?: SavedConfig,
	) => SimulationInstance;
}

/**
 * A running simulation instance with lifecycle controls.
 * Created by SimulationDefinition.create(), destroyed when navigating away.
 */
export interface SimulationInstance {
	/** Start the animation loop */
	start: () => void;
	/** Pause the animation loop */
	stop: () => void;
	/** Clean up all resources, event listeners, and state */
	destroy: () => void;
}
