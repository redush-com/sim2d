import type { Vec2 } from '../../../types';
import type { Firefly } from '../types';
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
 * Interpolates between dim amber and bright yellow-green based on brightness.
 * @param brightness - firefly brightness in [0, 1]
 * @returns an object with r, g, b color channels
 */
function getFireflyColor(brightness: number): { r: number; g: number; b: number } {
  const t = Math.min(1, Math.max(0, brightness));
  return {
    r: Math.floor(170 + t * 0),
    g: Math.floor(140 + t * 115),
    b: Math.floor(20 + t * 48),
  };
}

/**
 * Renders a single firefly as a radial gradient glow circle.
 * Size and opacity scale with brightness: brighter fireflies are larger and more opaque.
 * @param ctx - canvas 2D rendering context
 * @param firefly - firefly to render
 * @param width - canvas width in CSS pixels
 * @param height - canvas height in CSS pixels
 */
function renderFireflyGlow(
  ctx: CanvasRenderingContext2D,
  firefly: Firefly,
  width: number,
  height: number
): void {
  const pos = toCanvas(firefly.position, width, height);
  const b = firefly.brightness;
  const radius = 8 + b * 22;
  const opacity = 0.3 + b * 0.6;
  const { r, g, b: blue } = getFireflyColor(b);

  const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${blue}, ${opacity})`);
  gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${blue}, ${opacity * 0.4})`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${blue}, 0)`);

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Core dot
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 2 + b * 2, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 220, ${0.6 + b * 0.4})`;
  ctx.fill();
}

/**
 * Renders all fireflies with radial gradient glow effects.
 * Brighter fireflies appear larger and more vivid.
 * @param ctx - canvas 2D rendering context
 * @param fireflies - array of fireflies to render
 * @param width - canvas width in CSS pixels
 * @param height - canvas height in CSS pixels
 */
export function renderFireflies(
  ctx: CanvasRenderingContext2D,
  fireflies: Firefly[],
  width: number,
  height: number
): void {
  for (const firefly of fireflies) {
    renderFireflyGlow(ctx, firefly, width, height);
  }
}

/**
 * Renders subtle attraction lines between fireflies that are being attracted.
 * Lines are drawn from dimmer fireflies toward brighter ones with very low opacity.
 * @param ctx - canvas 2D rendering context
 * @param fireflies - array of fireflies
 * @param width - canvas width in CSS pixels
 * @param height - canvas height in CSS pixels
 */
export function renderAttractionLines(
  ctx: CanvasRenderingContext2D,
  fireflies: Firefly[],
  width: number,
  height: number
): void {
  const n = fireflies.length;

  for (let i = 0; i < n; i++) {
    let brightestJ = -1;
    let brightestVal = fireflies[i].brightness;

    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      if (fireflies[j].brightness > brightestVal) {
        brightestVal = fireflies[j].brightness;
        brightestJ = j;
      }
    }

    if (brightestJ < 0) continue;
    drawAttractionLine(ctx, fireflies[i], fireflies[brightestJ], width, height);
  }
}

/**
 * Draws a single faint attraction line between two fireflies.
 * @param ctx - canvas 2D rendering context
 * @param from - the dimmer firefly
 * @param to - the brighter firefly
 * @param width - canvas width in CSS pixels
 * @param height - canvas height in CSS pixels
 */
function drawAttractionLine(
  ctx: CanvasRenderingContext2D,
  from: Firefly,
  to: Firefly,
  width: number,
  height: number
): void {
  const posFrom = toCanvas(from.position, width, height);
  const posTo = toCanvas(to.position, width, height);
  const alpha = 0.05 + from.brightness * 0.05;

  ctx.beginPath();
  ctx.moveTo(posFrom.x, posFrom.y);
  ctx.lineTo(posTo.x, posTo.y);
  ctx.strokeStyle = `rgba(170, 255, 68, ${alpha})`;
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

/**
 * Renders the global best position as a small crosshair marker.
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
  time: number
): void {
  const pos = toCanvas(globalBest, width, height);
  const pulse = 1 + 0.2 * Math.sin(time * 3);
  const armLength = 8 * pulse;

  ctx.strokeStyle = 'rgba(170, 255, 68, 0.8)';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(pos.x - armLength, pos.y);
  ctx.lineTo(pos.x + armLength, pos.y);
  ctx.moveTo(pos.x, pos.y - armLength);
  ctx.lineTo(pos.x, pos.y + armLength);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#aaff44';
  ctx.fill();
}
