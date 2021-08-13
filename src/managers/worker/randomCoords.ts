import type { LevelParams, LevelCoords } from '@/managers/worker/types';
import { cloneBounds, min, max } from '@/utils/Array';
import { random } from '@/utils/Number';

const MIN_PLAYER_DISTANCE = 7.0;
const BOUND_OFFSET = 0.5;

const getRandomX = (minX: number, maxX: number, playerX: number): number => {
  let x: number;

  do {
    x = random(minX, maxX);
  } while (Math.abs(x - playerX) < MIN_PLAYER_DISTANCE);

  return x;
};

export const getRandomCoord = (params: LevelParams): LevelCoords => {
  const bounds = cloneBounds(params.bounds) as unknown as Array<Array<number>>;
  bounds.unshift(bounds.pop() as number[]);

  const rightBounds = bounds.slice(0, bounds.length / 2).slice(4);
  const leftBounds = bounds.slice(bounds.length / 2).slice(4);

  const minZ = params.minCoords[1] + BOUND_OFFSET,
        maxZ = params.maxCoords[1] - BOUND_OFFSET;

  const bottomPortals = [
    params.portals[2], params.portals[3],
    params.portals[4], params.portals[5]
  ];

  const topPortals = [
    params.portals[6], params.portals[7],
    params.portals[0], params.portals[1]
  ];

  let randomZ: number;

  do {
    randomZ = random(minZ, maxZ);
  } while (Math.abs(randomZ - params.player.z) < MIN_PLAYER_DISTANCE);

  if (randomZ > topPortals[0][1]) {
    const minX = min(topPortals.map(coords => coords[0]));
    const maxX = max(topPortals.map(coords => coords[0]));

    return [getRandomX(minX, maxX, params.player.x), randomZ];
  }

  if (randomZ < bottomPortals[0][1]) {
    const minX = min(bottomPortals.map(coords => coords[0]));
    const maxX = max(bottomPortals.map(coords => coords[0]));

    return [getRandomX(minX, maxX, params.player.x), randomZ];
  }

  let bottomRightX!: number, bottomLeftX!: number,
      topRightX!: number, topLeftX!: number;

  for (let b = 0, l = rightBounds.length - 1; b < l; b++) {
    if (rightBounds[b][1] > randomZ && rightBounds[b + 1][1] < randomZ) {
      topRightX = rightBounds[b][0] + BOUND_OFFSET;
      bottomLeftX = leftBounds[l - b][0] - BOUND_OFFSET;

      bottomRightX = rightBounds[b + 1][0] + BOUND_OFFSET;
      topLeftX = leftBounds[l - b - 1][0] - BOUND_OFFSET;

      break;
    }
  }

  return [
    getRandomX(
      Math.max(topRightX, bottomRightX),
      Math.min(topLeftX, bottomLeftX),
      params.player.x
    ), randomZ
  ];
};
