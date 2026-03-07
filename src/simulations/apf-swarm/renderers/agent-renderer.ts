import type { ApfAgentState } from '../types';
import { AGENT_COLORS } from '../config';
import * as vec from '../../../math/vector';

/**
 * Renders a single agent's trail as a fading polyline.
 * Opacity and width decrease toward the tail for a comet-like effect.
 * @param ctx - canvas 2D rendering context
 * @param agent - agent whose trail to render
 * @param color - base color string (HSL format)
 */
function renderTrail(ctx: CanvasRenderingContext2D, agent: ApfAgentState, color: string): void {
	const { trail } = agent;
	if (trail.length < 2) return;

	for (let i = 1; i < trail.length; i++) {
		const alpha = (i / trail.length) * 0.6;
		const width = (i / trail.length) * 2.5;

		ctx.beginPath();
		ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
		ctx.lineTo(trail[i].x, trail[i].y);
		ctx.strokeStyle = color.replace('60%)', `60%, ${alpha})`).replace('hsl(', 'hsla(');
		ctx.lineWidth = width;
		ctx.stroke();
	}
}

/**
 * Renders a single agent as a glowing circle with a directional indicator.
 * @param ctx - canvas 2D rendering context
 * @param agent - agent to render
 * @param color - agent color string
 */
function renderAgentBody(ctx: CanvasRenderingContext2D, agent: ApfAgentState, color: string): void {
	const { position, velocity } = agent;

	// Glow
	ctx.beginPath();
	ctx.arc(position.x, position.y, 14, 0, Math.PI * 2);
	ctx.fillStyle = color.replace('60%)', '60%, 0.15)').replace('hsl(', 'hsla(');
	ctx.fill();

	// Body
	ctx.beginPath();
	ctx.arc(position.x, position.y, 6, 0, Math.PI * 2);
	ctx.fillStyle = color;
	ctx.fill();

	// Direction indicator
	const speed = vec.magnitude(velocity);
	if (speed > 0.1) {
		const dir = vec.normalize(velocity);
		ctx.beginPath();
		ctx.moveTo(position.x + dir.x * 8, position.y + dir.y * 8);
		ctx.lineTo(position.x + dir.x * 14, position.y + dir.y * 14);
		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		ctx.stroke();
	}
}

/**
 * Renders all agents with their trails and body indicators.
 * @param ctx - canvas 2D rendering context
 * @param agents - array of agent states to render
 */
export function renderAgents(ctx: CanvasRenderingContext2D, agents: ApfAgentState[]): void {
	for (const agent of agents) {
		const color = AGENT_COLORS[agent.id % AGENT_COLORS.length];
		renderTrail(ctx, agent, color);
	}

	for (const agent of agents) {
		const color = AGENT_COLORS[agent.id % AGENT_COLORS.length];
		renderAgentBody(ctx, agent, color);
	}
}
