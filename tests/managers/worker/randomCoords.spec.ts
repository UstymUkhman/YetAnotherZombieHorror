import '../../globals';
import Limbo from '@/environment/Limbo';
import { Vector3 } from 'three/src/math/Vector3';
import { getRandomCoord } from '@/managers/worker/randomCoords';

describe('randomCoords', () => {
  test('getRandomCoord', () => {
    const maxCoords = Limbo.maxCoords;
    const minCoords = Limbo.minCoords;

    for (let i = 0; i < 10; i++) {
      const coords = getRandomCoord({
        portals: Limbo.portals,
        player: new Vector3(),
        bounds: Limbo.bounds,
        minCoords: minCoords,
        maxCoords: maxCoords
      });

      if (coords[1] > Limbo.portals[1][1]) {
        const maxX = Limbo.portals[6][0];
        const minX = Limbo.portals[0][0];

        expect(coords[0]).toBeLessThan(maxX);
        expect(coords[0]).toBeGreaterThan(minX);
      }

      else if (coords[1] < Limbo.portals[2][1]) {
        const maxX = Limbo.portals[4][0];
        const minX = Limbo.portals[2][0];

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
