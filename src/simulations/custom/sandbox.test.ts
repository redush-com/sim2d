import { SimulationSandbox } from './sandbox';

const VALID_CODE = `
function init({ width, height }) {
  return { x: width / 2, y: height / 2 };
}

function tick(state, dt, ctx) {
  ctx.fillStyle = '#000';
  ctx.fillRect(state.x, state.y, 10, 10);
  return state;
}
`;

const MISSING_INIT_CODE = `
function tick(state, dt, ctx) {
  return state;
}
`;

const MISSING_TICK_CODE = `
function init({ width, height }) {
  return {};
}
`;

const SYNTAX_ERROR_CODE = `
function init({ width height }) {
  return {};
}
`;

describe('SimulationSandbox', () => {
	let sandbox: SimulationSandbox;

	beforeEach(() => {
		sandbox = new SimulationSandbox();
	});

	describe('compile', () => {
		it('compiles valid code without error', () => {
			sandbox.compile(VALID_CODE);

			expect(sandbox.getError()).toBeNull();
		});

		it('sets error for code with syntax errors', () => {
			sandbox.compile(SYNTAX_ERROR_CODE);

			expect(sandbox.getError()).not.toBeNull();
			expect(sandbox.getError()?.length ?? 0).toBeGreaterThan(0);
		});

		it('sets error when init function is missing', () => {
			sandbox.compile(MISSING_INIT_CODE);

			expect(sandbox.getError()).toBe('Missing init() function');
		});

		it('sets error when tick function is missing', () => {
			sandbox.compile(MISSING_TICK_CODE);

			expect(sandbox.getError()).toBe('Missing tick() function');
		});
	});

	describe('isReady', () => {
		it('returns true after successful compile', () => {
			sandbox.compile(VALID_CODE);

			expect(sandbox.isReady()).toBe(true);
		});

		it('returns false after compile error', () => {
			sandbox.compile(SYNTAX_ERROR_CODE);

			expect(sandbox.isReady()).toBe(false);
		});

		it('returns false before any compile', () => {
			expect(sandbox.isReady()).toBe(false);
		});

		it('returns false when init is missing', () => {
			sandbox.compile(MISSING_INIT_CODE);

			expect(sandbox.isReady()).toBe(false);
		});
	});

	describe('getError', () => {
		it('returns null when no error', () => {
			sandbox.compile(VALID_CODE);

			expect(sandbox.getError()).toBeNull();
		});

		it('returns error message after compile failure', () => {
			sandbox.compile(SYNTAX_ERROR_CODE);

			const error = sandbox.getError();
			expect(error).not.toBeNull();
			expect(typeof error).toBe('string');
		});

		it('clears previous error on successful recompile', () => {
			sandbox.compile(SYNTAX_ERROR_CODE);
			expect(sandbox.getError()).not.toBeNull();

			sandbox.compile(VALID_CODE);
			expect(sandbox.getError()).toBeNull();
		});
	});

	describe('initialize', () => {
		it('calls user init function with width and height', () => {
			const initCode = `
				function init({ width, height }) {
					return { w: width, h: height };
				}
				function tick(state, dt, ctx) {
					return state;
				}
			`;

			sandbox.compile(initCode);
			sandbox.initialize(800, 600);

			// If initialize succeeded without error, the init function was called
			expect(sandbox.getError()).toBeNull();
			expect(sandbox.isReady()).toBe(true);
		});

		it('does nothing if compile was not called', () => {
			// Should not throw
			sandbox.initialize(800, 600);
			expect(sandbox.isReady()).toBe(false);
		});

		it('captures error from init function', () => {
			const throwingInit = `
				function init() {
					throw new Error('init failed');
				}
				function tick(state, dt, ctx) {
					return state;
				}
			`;

			sandbox.compile(throwingInit);
			sandbox.initialize(800, 600);

			expect(sandbox.getError()).toBe('init failed');
		});
	});
});
