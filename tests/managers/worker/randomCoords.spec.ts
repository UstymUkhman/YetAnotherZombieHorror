import GameLevel from '@/environment/GameLevel';
import { Vector3 } from 'three/src/math/Vector3';
import { getRandomCoord } from '@/managers/worker/randomCoords';

describe('randomCoords', () => {
  test('getRandomCoord', () => {
    const maxCoords = GameLevel.maxCoords;
    const minCoords = GameLevel.minCoords;

    for (let i = 0; i < 10; i++) {
      const coords = getRandomCoord({
        portals: GameLevel.portals,
        player: new Vector3(),
        bounds: GameLevel.bounds,
        minCoords: minCoords,
        maxCoords: maxCoords
      });

      if (coords[1] > GameLevel.portals[1][1]) {
        const maxX = GameLevel.portals[6][0];
        const minX = GameLevel.portals[0][0];

        expect(coords[0]).toBeLessThan(maxX);
        expect(coords[0]).toBeGreaterThan(minX);
      }

      else if (coords[1] < GameLevel.portals[2][1]) {
        const maxX = GameLevel.portals[4][0];
        const minX = GameLevel.portals[2][0];

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
