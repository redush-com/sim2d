import type { Vec2 } from '../../../types';

/**
 * Renders the goal as a pulsing crosshair with a glowing halo.
 * The pulse uses a sine wave based on the current timestamp.
 * @param ctx - canvas 2D rendering context
 * @param position - goal position
 * @param time - current time in seconds for animation
 */
export function renderGoal(ctx: CanvasRenderingContext2D, position: Vec2, time: number): void {
	const pulse = 1 + 0.3 * Math.sin(time * 4);
	const radius = 12 * pulse;

	// Outer glow
	ctx.beginPath();
	ctx.arc(position.x, position.y, radius * 2.5, 0, Math.PI * 2);
	ctx.fillStyle = 'rgba(0, 255, 100, 0.08)';
	ctx.fill();

	// Inner glow
	ctx.beginPath();
	ctx.arc(position.x, position.y, radius * 1.5, 0, Math.PI * 2);
	ctx.fillStyle = 'rgba(0, 255, 100, 0.15)';
	ctx.fill();

	// Crosshair lines
	ctx.strokeStyle = 'rgba(0, 255, 100, 0.9)';
	ctx.lineWidth = 2;
	const armLength = radius + 4;

	ctx.beginPath();
	ctx.moveTo(position.x - armLength, position.y);
	ctx.lineTo(position.x + armLength, position.y);
	ctx.moveTo(position.x, position.y - armLength);
	ctx.lineTo(position.x, position.y + armLength);
	ctx.stroke();

	// Center dot
	ctx.beginPath();
	ctx.arc(position.x, position.y, 3, 0, Math.PI * 2);
	ctx.fillStyle = '#00ff64';
	ctx.fill();
}
