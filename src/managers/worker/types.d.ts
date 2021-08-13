/// <reference lib="WebWorker" />

import type { Vector3 } from 'three/src/math/Vector3';
import type { Coords, Bounds } from '@/types';

type EventData   = { callback: Callback, params?: EventParams };
type EventParams = Record<string, unknown>;
type Callback    = (data: unknown) => void;

type LevelCoords = Coords;
type LevelBounds = Bounds;

type LevelParams = {
  minCoords: Coords,
  maxCoords: Coords,
  portals: Bounds,
  player: Vector3,
  bounds: Bounds
};

type RainParticles = [
  Array<number>,
  Array<number>
];

type RainParticle = {
  position: Vector3,
  velocity: Vector3,

  maxLife: number,
  alpha: number,
  life: number
};

type RainParams = {
  minCoords: Coords,
  maxCoords: Coords,
  camera: Vector3,
  delta: number
};
