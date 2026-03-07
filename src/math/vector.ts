import type { Vec2 } from '../types';

/**
 * Creates a new 2D vector.
 * @param x - horizontal component
 * @param y - vertical component
 * @returns a new Vec2
 */
export function create(x: number, y: number): Vec2 {
  return { x, y };
}

/**
 * Adds two vectors component-wise.
 * @param a - first vector
 * @param b - second vector
 * @returns the sum vector
 */
export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

/**
 * Subtracts vector b from vector a.
 * @param a - vector to subtract from
 * @param b - vector to subtract
 * @returns the difference vector
 */
export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

/**
 * Scales a vector by a scalar value.
 * @param v - vector to scale
 * @param s - scalar multiplier
 * @returns the scaled vector
 */
export function scale(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}

/**
 * Computes the magnitude (length) of a vector.
 * @param v - input vector
 * @returns the magnitude
 */
export function magnitude(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * Returns a unit vector in the same direction, or zero vector if magnitude is near zero.
 * @param v - input vector
 * @returns normalized vector
 */
export function normalize(v: Vec2): Vec2 {
  const mag = magnitude(v);
  if (mag < 1e-10) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
}

/**
 * Computes the Euclidean distance between two points.
 * @param a - first point
 * @param b - second point
 * @returns the distance
 */
export function distance(a: Vec2, b: Vec2): number {
  return magnitude(sub(a, b));
}

/**
 * Clamps a vector's magnitude to a maximum value.
 * @param v - input vector
 * @param max - maximum allowed magnitude
 * @returns clamped vector
 */
export function clampMagnitude(v: Vec2, max: number): Vec2 {
  const mag = magnitude(v);
  if (mag <= max) return v;
  return scale(normalize(v), max);
}

/**
 * Returns a random unit vector with uniform angular distribution.
 * @returns a random direction vector with magnitude 1
 */
export function randomUnit(): Vec2 {
  const angle = Math.random() * Math.PI * 2;
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

/** Zero vector constant */
export const ZERO: Vec2 = { x: 0, y: 0 };
