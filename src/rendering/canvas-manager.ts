/**
 * Sets up a canvas element with proper DPI scaling and returns the 2D context.
 * Handles devicePixelRatio for sharp rendering on high-DPI displays.
 * @param canvas - the canvas element to configure
 * @returns the 2D rendering context
 */
export function setupCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Failed to get 2D rendering context');

	applyDpiScaling(canvas, ctx);
	return ctx;
}

/**
 * Applies DPI scaling to match the device pixel ratio.
 * @param canvas - the canvas element
 * @param ctx - the 2D context
 */
export function applyDpiScaling(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
	const dpr = window.devicePixelRatio || 1;
	canvas.width = canvas.clientWidth * dpr;
	canvas.height = canvas.clientHeight * dpr;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.scale(dpr, dpr);
}
