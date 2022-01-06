import type { Vector3 } from 'three/src/math/Vector3';

type LevelBounds   = Readonly<Array<LevelCoords>>;
type LevelCoords   = Readonly<[number, number]>;

type LevelParams = CoordsParams & {
  portals: LevelBounds,
  bounds: LevelBounds,
  player: Vector3
};

type CoordsParams = {
  minCoords: LevelCoords,
  maxCoords: LevelCoords
};
