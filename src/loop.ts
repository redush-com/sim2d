/** Controls for the animation loop */
export interface LoopControls {
	start: () => void;
	stop: () => void;
	toggle: () => void;
	isRunning: () => boolean;
}

/**
 * Creates a requestAnimationFrame loop with delta-time calculation.
 * Delta time is capped at 50ms to prevent spiral-of-death on tab switches.
 * @param tickFn - called each frame with delta time in seconds
 * @param renderFn - called each frame after tick to draw the scene
 * @returns loop controls (start, stop, toggle)
 */
export function createLoop(
	tickFn: (dt: number) => void,
	renderFn: (time: number) => void,
): LoopControls {
	let running = false;
	let lastTime = 0;
	let animationId = 0;
	let elapsed = 0;

	/** Single frame: compute dt, tick physics, render scene */
	function frame(timestamp: number): void {
		if (!running) return;

		const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
		lastTime = timestamp;
		elapsed += dt;

		tickFn(dt);
		renderFn(elapsed);

		animationId = requestAnimationFrame(frame);
	}

	return {
		start() {
			if (running) return;
			running = true;
			lastTime = performance.now();
			animationId = requestAnimationFrame(frame);
		},
		stop() {
			running = false;
			cancelAnimationFrame(animationId);
		},
		toggle() {
			if (running) this.stop();
			else this.start();
		},
		isRunning() {
			return running;
		},
	};
}
