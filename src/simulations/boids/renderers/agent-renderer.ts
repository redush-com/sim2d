import type { BoidAgent } from '../types';
import { AGENT_COLORS } from '../config';
import * as vec from '../../../math/vector';

/**
 * Renders a single agent's trail as a fading polyline.
 * Opacity decreases toward the tail for a subtle comet-like effect.
 * @param ctx - canvas 2D rendering context
 * @param agent - agent whose trail to render
 * @param color - base HSL color string
 */
function renderTrail(ctx: CanvasRenderingContext2D, agent: BoidAgent, color: string): void {
	const { trail } = agent;
	if (trail.length < 2) return;

	for (let i = 1; i < trail.length; i++) {
		const alpha = (i / trail.length) * 0.4;
		const width = (i / trail.length) * 1.5;

		ctx.beginPath();
		ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
		ctx.lineTo(trail[i].x, trail[i].y);
		ctx.strokeStyle = color.replace('60%)', `60%, ${alpha})`).replace('hsl(', 'hsla(');
		ctx.lineWidth = width;
		ctx.stroke();
	}
}

/**
 * Renders a single boid as a directional triangle pointing in its velocity direction.
 * The triangle has a filled body and a subtle glow effect.
 * @param ctx - canvas 2D rendering context
 * @param agent - the boid agent to render
 * @param color - HSL color string for this agent
 */
function renderAgentBody(ctx: CanvasRenderingContext2D, agent: BoidAgent, color: string): void {
	const { position, velocity } = agent;
	const speed = vec.magnitude(velocity);
	const angle = speed > 0.1 ? Math.atan2(velocity.y, velocity.x) : 0;

	const size = 6;
	const halfBase = 4;

	// Glow
	ctx.beginPath();
	ctx.arc(position.x, position.y, 10, 0, Math.PI * 2);
	ctx.fillStyle = color.replace('60%)', '60%, 0.1)').replace('hsl(', 'hsla(');
	ctx.fill();

	// Directional triangle
	const tipX = position.x + Math.cos(angle) * size;
	const tipY = position.y + Math.sin(angle) * size;
	const leftX = position.x + Math.cos(angle + 2.5) * halfBase;
	const leftY = position.y + Math.sin(angle + 2.5) * halfBase;
	const rightX = position.x + Math.cos(angle - 2.5) * halfBase;
	const rightY = position.y + Math.sin(angle - 2.5) * halfBase;

	ctx.beginPath();
	ctx.moveTo(tipX, tipY);
	ctx.lineTo(leftX, leftY);
	ctx.lineTo(rightX, rightY);
	ctx.closePath();
	ctx.fillStyle = color;
	ctx.fill();
}

/**
 * Renders all boid agents with their trails and directional triangle bodies.
 * Trails are drawn first so agent bodies appear on top.
 * @param ctx - canvas 2D rendering context
 * @param agents - array of boid agents to render
 */
export function renderAgents(ctx: CanvasRenderingContext2D, agents: BoidAgent[]): void {
	for (const agent of agents) {
		const color = AGENT_COLORS[agent.id % AGENT_COLORS.length];
		renderTrail(ctx, agent, color);
	}

	for (const agent of agents) {
		const color = AGENT_COLORS[agent.id % AGENT_COLORS.length];
		renderAgentBody(ctx, agent, color);
	}
}
