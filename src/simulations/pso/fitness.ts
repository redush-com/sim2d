/** Fitness function signature: takes (x, y) in search space, returns scalar */
export type FitnessFunction = (x: number, y: number) => number;

/**
 * Rastrigin function. Highly multimodal with many local minima.
 * Global minimum: f(0, 0) = 0.
 * @param x - first coordinate
 * @param y - second coordinate
 * @returns fitness value (lower is better)
 */
export function rastrigin(x: number, y: number): number {
	return 20 + (x * x - 10 * Math.cos(2 * Math.PI * x)) + (y * y - 10 * Math.cos(2 * Math.PI * y));
}

/**
 * Rosenbrock function (banana function). Has a narrow curved valley.
 * Global minimum: f(1, 1) = 0.
 * @param x - first coordinate
 * @param y - second coordinate
 * @returns fitness value (lower is better)
 */
export function rosenbrock(x: number, y: number): number {
	return (1 - x) * (1 - x) + 100 * (y - x * x) * (y - x * x);
}

/**
 * Ackley function. Nearly flat outer region with a large hole at the center.
 * Global minimum: f(0, 0) = 0.
 * @param x - first coordinate
 * @param y - second coordinate
 * @returns fitness value (lower is better)
 */
export function ackley(x: number, y: number): number {
	return (
		-20 * Math.exp(-0.2 * Math.sqrt(0.5 * (x * x + y * y))) -
		Math.exp(0.5 * (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y))) +
		Math.E +
		20
	);
}

/**
 * Sphere function. Simple convex bowl.
 * Global minimum: f(0, 0) = 0.
 * @param x - first coordinate
 * @param y - second coordinate
 * @returns fitness value (lower is better)
 */
export function sphere(x: number, y: number): number {
	return x * x + y * y;
}

/** Ordered array of all available fitness functions */
export const FITNESS_FUNCTIONS: FitnessFunction[] = [rastrigin, rosenbrock, ackley, sphere];

/**
 * Returns the fitness function for the given index.
 * @param index - function index (0=Rastrigin, 1=Rosenbrock, 2=Ackley, 3=Sphere)
 * @returns the selected fitness function
 */
export function getFitnessFunction(index: number): FitnessFunction {
	return FITNESS_FUNCTIONS[Math.max(0, Math.min(index, FITNESS_FUNCTIONS.length - 1))];
}
