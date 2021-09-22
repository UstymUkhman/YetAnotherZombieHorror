import { getRandomCoord } from '@/worker/getRandomCoord';
import LevelScene from '@/environment/LevelScene';
import { Vector3 } from 'three/src/math/Vector3';

describe('getRandomCoord', () => {
  test('getRandomCoord', () => {
    const maxCoords = LevelScene.maxCoords;
    const minCoords = LevelScene.minCoords;

    for (let i = 0; i < 10; i++) {
      const coords = getRandomCoord({
        portals: LevelScene.portals,
        bounds: LevelScene.bounds,
        player: new Vector3(),
        minCoords: minCoords,
        maxCoords: maxCoords
      });

      if (coords[1] > LevelScene.portals[1][1]) {
        const maxX = LevelScene.portals[6][0];
        const minX = LevelScene.portals[0][0];

        expect(coords[0]).toBeLessThan(maxX);
        expect(coords[0]).toBeGreaterThan(minX);
      }

      else if (coords[1] < LevelScene.portals[2][1]) {
        const maxX = LevelScene.portals[4][0];
        const minX = LevelScene.portals[2][0];

        expect(coords[0]).toBeLessThan(maxX);
        expect(coords[0]).toBeGreaterThan(minX);
      }

      else {
        expect(coords[0]).toBeLessThan(44.5);
        expect(coords[0]).toBeGreaterThan(-10.0);
      }

      expect(coords[1]).toBeGreaterThan(minCoords[1]);
      expect(coords[1]).toBeLessThan(maxCoords[1]);
    }
  });
});
