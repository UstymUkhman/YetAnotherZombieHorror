import type { Vector3 } from 'three/src/math/Vector3';

type RainParticles = [Array<number>, Array<number>];
type LevelBounds   = Readonly<Array<LevelCoords>>;
type LevelCoords   = Readonly<[number, number]>;

type LevelParams = CoordsParams & {
  portals: LevelBounds,
  bounds: LevelBounds,
  player: Vector3
};

type RainParams = CoordsParams & {
  camera: Vector3,
  delta: number
};

type CoordsParams = {
  minCoords: LevelCoords,
  maxCoords: LevelCoords
};

type RainParticle = {
  position: Vector3,
  velocity: Vector3,

  maxLife: number,
  alpha: number,
  life: number
};
