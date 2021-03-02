type Vector3 = import('three/src/math/Vector3').Vector3;
import type { Coords, Bounds } from '@/types.d';
import { cloneBounds } from '@/utils/Array';
import { random } from '@/utils/Number';

const MIN_PLAYER_DISTANCE = 10.0;
const LEVEL0_TOP_COORD = 37.0;
const BOUND_OFFSET = 0.5;

export type LevelParams = {
  minCoords: Coords,
  maxCoords: Coords,
  player: Vector3,
  bounds: Bounds
};

export const getRandomCoord = (params: LevelParams): Coords => {
  const bounds = cloneBounds(params.bounds) as unknown as Array<Array<number>>;
  bounds.push(bounds.shift() as Array<number>);

  const rightBounds = bounds.filter(bound => bound[0] < BOUND_OFFSET);
  const leftBounds = bounds.filter(bound => bound[0] >= BOUND_OFFSET);

  let minRightX = -Infinity, minLeftX = -Infinity,
      minRightZ = -Infinity, minLeftZ = -Infinity,
      maxRightX =  Infinity, maxLeftX =  Infinity,
      maxRightZ =  Infinity, maxLeftZ =  Infinity;

  const minZ = params.minCoords[1] + BOUND_OFFSET,
        maxZ = params.maxCoords[1] - BOUND_OFFSET;

  let tooCloseX: boolean, tooCloseZ: boolean;
  let randomX: number, randomZ: number;

  do {
    randomZ = random(minZ, maxZ);
    tooCloseZ = Math.abs(randomZ - params.player.z) < MIN_PLAYER_DISTANCE;
  } while (randomZ < LEVEL0_TOP_COORD && tooCloseZ);

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

  const minX = Math.max(minRightX, maxRightX) + BOUND_OFFSET;

  const maxX = (
    randomZ < LEVEL0_TOP_COORD ? Math.min : Math.max
  )(minLeftX, maxLeftX) - BOUND_OFFSET;

  do {
    randomX = random(minX, maxX);
    tooCloseX = Math.abs(randomX - params.player.x) < MIN_PLAYER_DISTANCE;
  } while (tooCloseX && tooCloseZ);

  return [randomX, randomZ];
};
