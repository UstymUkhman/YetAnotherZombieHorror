import type { Vector3 } from 'three/src/math/Vector3';

export const smoothstep = (min: number, max: number, value: number): number => Math.max(0, Math.min(1, (value - min) / (max - min)));
export const near = (p: Vector3, c: Vector3, r = 1): boolean => Math.pow(p.x - c.x, 2) + Math.pow(p.z - c.z, 2) < Math.pow(r, 2);
export const mix = (value1: number, value2: number, percent: number): number => value1 * (1 - percent) + value2 * percent;
export const map = (value: number, min: number, max: number): number => clamp((value - min) / (max - min), min, max);
export const randomInt = (min: number, max: number): number => (Math.random() * (max - min + 1) >> 0) + min;

export const clamp = (value: number, min = 0, max = 1): number => Math.max(min, Math.min(value, max));
export const random = (min: number, max: number): number => Math.random() * (max - min) + min;
export const easeOutSine = (v: number): number => !v ? 0 : v === 1 ? 1 : Math.sin(v * PI.d2);
export const lerp = (v0: number, v1: number, t: number): number => v0 + t * (v1 - v0);

export const PI = Object.freeze({
  m2: Math.PI * 2,
  d2: Math.PI / 2,
  d3: Math.PI / 3,
  d4: Math.PI / 4,
  d6: Math.PI / 6
});
