import type { Vec2 } from '../../../types';
import type { Particle } from '../types';
import { SEARCH_BOUNDS, SEARCH_RANGE } from '../config';

/**
 * Converts a search-space coordinate to a canvas pixel coordinate.
 * @param searchPos - position in search space
 * @param width - canvas width in CSS pixels
 * @param height - canvas height in CSS pixels
 * @returns pixel position on canvas
 */
function toCanvas(searchPos: Vec2, width: number, height: number): Vec2 {
	return {
		x: ((searchPos.x - SEARCH_BOUNDS.min) / SEARCH_RANGE) * width,
		y: ((searchPos.y - SEARCH_BOUNDS.min) / SEARCH_RANGE) * height,
	};
}

/**
 * Renders a single particle as a small circle with a line to its personal best.
 * @param ctx - canvas 2D rendering context
 * @param particle - particle to render
 * @param width - canvas width in CSS pixels
 * @param height - canvas height in CSS pixels
 */
function renderParticle(
	ctx: CanvasRenderingContext2D,
	particle: Particle,
	width: number,
	height: number,
): void {
	const pos = toCanvas(particle.position, width, height);
	const pBest = toCanvas(particle.personalBestPosition, width, height);

	// Line from current position to personal best
	ctx.beginPath();
	ctx.moveTo(pos.x, pos.y);
	ctx.lineTo(pBest.x, pBest.y);
	ctx.strokeStyle = 'rgba(100, 180, 255, 0.25)';
	ctx.lineWidth = 1;
	ctx.stroke();

	// Personal best marker (small diamond)
	ctx.beginPath();
	ctx.arc(pBest.x, pBest.y, 2.5, 0, Math.PI * 2);
	ctx.fillStyle = 'rgba(100, 180, 255, 0.4)';
	ctx.fill();

	// Particle body (glow)
	ctx.beginPath();
	ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
	ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
	ctx.fill();

	// Particle body (core)
	ctx.beginPath();
	ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
	ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
	ctx.fill();
}

/**
 * Renders all particles in the swarm with lines to their personal bests.
 * @param ctx - canvas 2D rendering context
 * @param particles - array of particles to render
 * @param width - canvas width in CSS pixels
 * @param height - canvas height in CSS pixels
 */
export function renderParticles(
	ctx: CanvasRenderingContext2D,
	particles: Particle[],
	width: number,
	height: number,
): void {
	for (const particle of particles) {
		renderParticle(ctx, particle, width, height);
	}
}

/**
 * Renders the global best position as a pulsing crosshair marker.
 * @param ctx - canvas 2D rendering context
 * @param globalBest - global best position in search space
 * @param width - canvas width in CSS pixels
 * @param height - canvas height in CSS pixels
 * @param time - elapsed time in seconds for pulse animation
 */
export function renderGlobalBest(
	ctx: CanvasRenderingContext2D,
	globalBest: Vec2,
	width: number,
	height: number,
	time: number,
): void {
	const pos = toCanvas(globalBest, width, height);
	const pulse = 1 + 0.3 * Math.sin(time * 4);
	const radius = 10 * pulse;

	// Outer glow
	ctx.beginPath();
	ctx.arc(pos.x, pos.y, radius * 2.5, 0, Math.PI * 2);
	ctx.fillStyle = 'rgba(0, 255, 100, 0.08)';
	ctx.fill();

	// Inner glow
	ctx.beginPath();
	ctx.arc(pos.x, pos.y, radius * 1.5, 0, Math.PI * 2);
	ctx.fillStyle = 'rgba(0, 255, 100, 0.15)';
	ctx.fill();

	// Crosshair
	ctx.strokeStyle = 'rgba(0, 255, 100, 0.9)';
	ctx.lineWidth = 2;
	const armLength = radius + 4;

	ctx.beginPath();
	ctx.moveTo(pos.x - armLength, pos.y);
	ctx.lineTo(pos.x + armLength, pos.y);
	ctx.moveTo(pos.x, pos.y - armLength);
	ctx.lineTo(pos.x, pos.y + armLength);
	ctx.stroke();

	// Center dot
	ctx.beginPath();
	ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
	ctx.fillStyle = '#00ff64';
	ctx.fill();
}
