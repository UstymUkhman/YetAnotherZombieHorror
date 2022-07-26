export type LevelBounds = Readonly<Array<LevelCoords>>;
export type LevelCoords = Readonly<[number, number]>;

export type LevelParams = CoordsParams & {
  portals: LevelBounds,
  bounds: LevelBounds
};

export type CoordsParams = {
  minCoords: LevelCoords,
  maxCoords: LevelCoords
};
