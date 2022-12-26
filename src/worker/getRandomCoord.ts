import type { LevelParams, LevelCoords } from '@/scenes/types';
import { cloneBounds, min, max } from '@/utils/Array';
import { random } from '@/utils/Number';
import Configs from '@/configs';

export const getRandomCoord = (params: LevelParams): LevelCoords => {
  const bounds = cloneBounds(params.bounds) as unknown as Array<Array<number>>;
  const { boundOffset } = Configs.RandomCoords;
  bounds.unshift(bounds.pop() as number[]);

  const rightBounds = bounds.slice(0, bounds.length / 2).slice(4);
  const leftBounds = bounds.slice(bounds.length / 2).slice(4);

  const minZ = params.minCoords[1] + boundOffset,
        maxZ = params.maxCoords[1] - boundOffset;

  const bottomPortals = [
    params.portals[2], params.portals[3],
    params.portals[4], params.portals[5]
  ];

  const topPortals = [
    params.portals[6], params.portals[7],
    params.portals[0], params.portals[1]
  ];

  const randomZ = random(minZ, maxZ);

  if (randomZ > topPortals[0][1]) {
    const minX = min(topPortals.map(coords => coords[0]));
    const maxX = max(topPortals.map(coords => coords[0]));

    return [random(minX, maxX), randomZ];
  }

  if (randomZ < bottomPortals[0][1]) {
    const minX = min(bottomPortals.map(coords => coords[0]));
    const maxX = max(bottomPortals.map(coords => coords[0]));

    return [random(minX, maxX), randomZ];
  }

  let bottomRightX!: number, bottomLeftX!: number,
      topRightX!: number, topLeftX!: number;

  for (let b = 0, l = rightBounds.length - 1; b < l; b++) {
    if (rightBounds[b][1] > randomZ && rightBounds[b + 1][1] < randomZ) {
      topRightX = rightBounds[b][0] + boundOffset;
      bottomLeftX = leftBounds[l - b][0] - boundOffset;

      bottomRightX = rightBounds[b + 1][0] + boundOffset;
      topLeftX = leftBounds[l - b - 1][0] - boundOffset;

      break;
    }
  }

  return [
    random(
      Math.max(topRightX, bottomRightX),
      Math.min(topLeftX, bottomLeftX)
    ) | 0, randomZ | 0
  ];
};
