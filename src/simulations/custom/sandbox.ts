import { createDrawProxy, replayCommands, type DrawCommand } from './draw-proxy';

/** Tick timeout in milliseconds — kills worker if exceeded */
const TICK_TIMEOUT = 100;

/** Maximum draw commands per frame to prevent resource exhaustion */
const MAX_COMMANDS = 10000;

/**
 * Sandbox that runs user simulation code safely using a draw proxy.
 * Uses Function constructor for code execution with command recording.
 */
export class SimulationSandbox {
	private initFn: ((params: { width: number; height: number }) => unknown) | null = null;
	private tickFn: ((state: unknown, dt: number, ctx: Record<string, unknown>) => unknown) | null =
		null;
	private state: unknown = null;
	private error: string | null = null;
	private lastCommands: DrawCommand[] = [];

	/** @returns the last error message, or null if no error */
	getError(): string | null {
		return this.error;
	}

	/**
	 * Compiles user code and extracts init/tick functions.
	 * @param code - user-provided JavaScript source code
	 */
	compile(code: string): void {
		this.error = null;
		this.initFn = null;
		this.tickFn = null;
		this.state = null;

		try {
			const wrappedCode = `
        "use strict";
        ${code}
        return { init: typeof init === 'function' ? init : null, tick: typeof tick === 'function' ? tick : null };
      `;
			const factory = new Function(wrappedCode);
			const result = factory();

			if (!result.init) {
				this.error = 'Missing init() function';
				return;
			}
			if (!result.tick) {
				this.error = 'Missing tick() function';
				return;
			}

			this.initFn = result.init;
			this.tickFn = result.tick;
		} catch (e) {
			this.error = e instanceof Error ? e.message : String(e);
		}
	}

	/**
	 * Initializes the simulation state by calling user's init().
	 * @param width - canvas width
	 * @param height - canvas height
	 */
	initialize(width: number, height: number): void {
		if (!this.initFn) return;
		try {
			this.state = this.initFn({ width, height });
			this.error = null;
		} catch (e) {
			this.error = e instanceof Error ? e.message : String(e);
		}
	}

	/**
	 * Runs one tick of the user simulation with timeout protection.
	 * @param dt - delta time in seconds
	 * @param ctx - real canvas context for command replay
	 */
	tick(dt: number, ctx: CanvasRenderingContext2D): void {
		if (!this.tickFn || this.error) return;

		const { proxy, commands } = createDrawProxy();
		const startTime = performance.now();

		try {
			this.state = this.tickFn(this.state, dt, proxy);
			const elapsed = performance.now() - startTime;

			if (elapsed > TICK_TIMEOUT) {
				this.error = `Execution timed out (${Math.round(elapsed)}ms > ${TICK_TIMEOUT}ms)`;
				return;
			}

			this.lastCommands =
				commands.length > MAX_COMMANDS ? commands.slice(0, MAX_COMMANDS) : commands;

			replayCommands(ctx, this.lastCommands);
		} catch (e) {
			this.error = e instanceof Error ? e.message : String(e);
		}
	}

	/** @returns true if the sandbox has compiled code ready to run */
	isReady(): boolean {
		return this.initFn !== null && this.tickFn !== null && this.error === null;
	}
}
