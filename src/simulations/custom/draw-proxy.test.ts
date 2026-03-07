import { createDrawProxy } from './draw-proxy';

describe('createDrawProxy', () => {
	it('returns a proxy object and an empty commands array', () => {
		const { proxy, commands } = createDrawProxy();

		expect(proxy).toBeDefined();
		expect(Array.isArray(commands)).toBe(true);
		expect(commands).toHaveLength(0);
	});
});

describe('method calls', () => {
	it('records allowed method calls as commands', () => {
		const { proxy, commands } = createDrawProxy();

		(proxy.fillRect as (...args: unknown[]) => unknown)(10, 20, 100, 50);

		expect(commands).toHaveLength(1);
		expect(commands[0].method).toBe('fillRect');
		expect(commands[0].args).toEqual([10, 20, 100, 50]);
	});

	it('records multiple method calls in order', () => {
		const { proxy, commands } = createDrawProxy();

		(proxy.beginPath as (...args: unknown[]) => unknown)();
		(proxy.moveTo as (...args: unknown[]) => unknown)(0, 0);
		(proxy.lineTo as (...args: unknown[]) => unknown)(100, 100);
		(proxy.stroke as (...args: unknown[]) => unknown)();

		expect(commands).toHaveLength(4);
		expect(commands[0].method).toBe('beginPath');
		expect(commands[1].method).toBe('moveTo');
		expect(commands[2].method).toBe('lineTo');
		expect(commands[3].method).toBe('stroke');
	});

	it('records arc call with all arguments', () => {
		const { proxy, commands } = createDrawProxy();

		(proxy.arc as (...args: unknown[]) => unknown)(50, 50, 25, 0, Math.PI * 2);

		expect(commands).toHaveLength(1);
		expect(commands[0].method).toBe('arc');
		expect(commands[0].args).toEqual([50, 50, 25, 0, Math.PI * 2]);
	});
});

describe('property sets', () => {
	it('records property assignments as set: commands', () => {
		const { proxy, commands } = createDrawProxy();

		proxy.fillStyle = '#ff0000';

		expect(commands).toHaveLength(1);
		expect(commands[0].method).toBe('set:fillStyle');
		expect(commands[0].args).toEqual(['#ff0000']);
	});

	it('records multiple property sets', () => {
		const { proxy, commands } = createDrawProxy();

		proxy.fillStyle = 'blue';
		proxy.lineWidth = 3;
		proxy.globalAlpha = 0.5;

		expect(commands).toHaveLength(3);
		expect(commands[0].method).toBe('set:fillStyle');
		expect(commands[1].method).toBe('set:lineWidth');
		expect(commands[2].method).toBe('set:globalAlpha');
	});
});

describe('unknown methods and properties', () => {
	it('does not record access to unknown properties', () => {
		const { proxy, commands } = createDrawProxy();

		// Accessing an unknown property should not throw or record
		void proxy.unknownProperty;

		expect(commands).toHaveLength(0);
	});

	it('unknown methods are undefined (not functions)', () => {
		const { proxy } = createDrawProxy();

		expect(proxy.notAMethod).toBeUndefined();
	});
});
