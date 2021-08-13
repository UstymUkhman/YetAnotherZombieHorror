import type { Coords } from '@/types';

export const getScaledCoords = (coords: Coords, minCoords: Coords, scale: number): Coords =>
  [coords[0] * scale + scale * minCoords[0], coords[1] * scale + scale * minCoords[1]];

export const pointInCircle = (pCoords: Coords, cCoords: Coords, radius: number): boolean =>
  Math.sqrt(Math.pow(pCoords[0] - cCoords[0], 2) + Math.pow(pCoords[1] - cCoords[1], 2)) < radius;

export const getAngleToRifle = (playerCoords: Coords, rifleCoords: Coords): number =>
  Math.atan2(-(playerCoords[0] - rifleCoords[0]), playerCoords[1] - rifleCoords[1]) * 180 / Math.PI + 180;
