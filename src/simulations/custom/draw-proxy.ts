/** A single draw command captured from user code */
export interface DrawCommand {
	method: string;
	args: unknown[];
}

/** Allowed Canvas2D methods that user code can call */
const ALLOWED_METHODS = new Set([
	'fillRect',
	'strokeRect',
	'clearRect',
	'beginPath',
	'closePath',
	'moveTo',
	'lineTo',
	'arc',
	'arcTo',
	'quadraticCurveTo',
	'bezierCurveTo',
	'rect',
	'ellipse',
	'fill',
	'stroke',
	'save',
	'restore',
	'translate',
	'rotate',
	'scale',
	'setTransform',
]);

/** Allowed Canvas2D properties that user code can set */
const ALLOWED_PROPS = new Set([
	'fillStyle',
	'strokeStyle',
	'lineWidth',
	'lineCap',
	'lineJoin',
	'globalAlpha',
	'globalCompositeOperation',
	'font',
	'textAlign',
	'textBaseline',
	'shadowColor',
	'shadowBlur',
	'shadowOffsetX',
	'shadowOffsetY',
]);

/**
 * Creates a proxy object that mimics Canvas2D API but records draw commands.
 * Used inside the Web Worker where the real canvas is not available.
 * @returns proxy context and the collected commands array
 */
export function createDrawProxy(): { proxy: Record<string, unknown>; commands: DrawCommand[] } {
	const commands: DrawCommand[] = [];

	const proxy: Record<string, unknown> = {};

	for (const method of ALLOWED_METHODS) {
		proxy[method] = (...args: unknown[]) => {
			commands.push({ method, args });
		};
	}

	for (const prop of ALLOWED_PROPS) {
		Object.defineProperty(proxy, prop, {
			set(value: unknown) {
				commands.push({ method: `set:${prop}`, args: [value] });
			},
			get() {
				return undefined;
			},
		});
	}

	return { proxy, commands };
}

/**
 * Replays recorded draw commands on a real Canvas2D context.
 * @param ctx - the real canvas 2D rendering context
 * @param commands - array of draw commands to replay
 */
export function replayCommands(ctx: CanvasRenderingContext2D, commands: DrawCommand[]): void {
	for (const cmd of commands) {
		if (cmd.method.startsWith('set:')) {
			const prop = cmd.method.slice(4);
			(ctx as unknown as Record<string, unknown>)[prop] = cmd.args[0];
		} else {
			const fn = (ctx as unknown as Record<string, (...a: unknown[]) => void>)[cmd.method];
			if (typeof fn === 'function') {
				fn.apply(ctx, cmd.args);
			}
		}
	}
}
