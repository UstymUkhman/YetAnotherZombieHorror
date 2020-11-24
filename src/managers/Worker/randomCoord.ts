import { Coords, Bounds } from '@/types';
import { random } from '@/utils/Number';

export type LevelParams = {
  minCoords: Coords,
  maxCoords: Coords,
  bounds: Bounds
};

export const getRandomCoord = (params: LevelParams): Coords => {
  let minRightX = -Infinity, minLeftX = -Infinity, maxRightX = Infinity, maxLeftX = Infinity;
  let minRightZ = -Infinity, minLeftZ = -Infinity, maxRightZ = Infinity, maxLeftZ = Infinity;

  const bounds = params.bounds as unknown as Array<Array<number>>;
  const minZ = params.minCoords[1], maxZ = params.maxCoords[1];

  const randomZ = random(minZ + 0.5, maxZ - 0.5);
  bounds.push(bounds.shift() as Array<number>);

  const rightBounds = bounds.filter(bound => bound[0] < 0);
  const leftBounds = bounds.filter(bound => bound[0] > 0);

  rightBounds.forEach(bound => {
    const z = bound[1];

    if (z < randomZ && z > minRightZ) {
      minRightX = bound[0];
      minRightZ = z;
    }

    if (z > randomZ && z < maxRightZ) {
      maxRightX = bound[0];
      maxRightZ = z;
    }
  });

  leftBounds.forEach(bound => {
    const z = bound[1];

    if (z < randomZ && z > minLeftZ) {
      minLeftX = bound[0];
      minLeftZ = z;
    }

    if (z > randomZ && z < maxLeftZ) {
      maxLeftX = bound[0];
      maxLeftZ = z;
    }
  });

  return [random(
    Math.max(minRightX, maxRightX) + 0.5,
    Math.min(minLeftX, maxLeftX) - 0.5
  ), randomZ];
};
