type LevelBounds = Readonly<Array<LevelCoords>>;
type LevelCoords = Readonly<[number, number]>;

type LevelParams = CoordsParams & {
  portals: LevelBounds,
  bounds: LevelBounds
};

type CoordsParams = {
  minCoords: LevelCoords,
  maxCoords: LevelCoords
};
