type Vector3 = import('@three/math/Vector3').Vector3;
import { Coords, Bounds } from '@/types';
import { random } from '@/utils/Number';

export type LevelParams = {
  minCoords: Coords,
  maxCoords: Coords,
  player: Vector3,
  bounds: Bounds
};

export const getRandomCoord = (params: LevelParams): Coords => {
  const bounds = params.bounds as unknown as Array<Array<number>>;
  bounds.push(bounds.shift() as Array<number>);

  const rightBounds = bounds.filter(bound => bound[0] < 0);
  const leftBounds = bounds.filter(bound => bound[0] > 0);

  let minRightX = -Infinity, minLeftX = -Infinity,
      minRightZ = -Infinity, minLeftZ = -Infinity,
      maxRightX =  Infinity, maxLeftX =  Infinity,
      maxRightZ =  Infinity, maxLeftZ =  Infinity;

  const minZ = params.minCoords[1] + 0.5,
        maxZ = params.maxCoords[1] - 0.5;

  let tooCloseX: boolean, tooCloseZ: boolean;
  let randomX: number, randomZ: number;

  do {
    randomZ = random(minZ, maxZ);
    tooCloseZ = Math.abs(randomZ - params.player.z) < 10.0;
  } while (randomZ < 37.0 && tooCloseZ);

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

  const minX = Math.max(minRightX, maxRightX) + 0.5;

  const maxX = (randomZ < 37.0
    ? Math.min(minLeftX, maxLeftX)
    : Math.max(minLeftX, maxLeftX)) - 0.5;

  do {
    randomX = random(minX, maxX);
    tooCloseX = Math.abs(randomX - params.player.x) < 10.0;
  } while (tooCloseX && tooCloseZ);

  return [randomX, randomZ];
};
