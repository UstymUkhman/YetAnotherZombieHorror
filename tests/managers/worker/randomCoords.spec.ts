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
        player: new Vector3(),
        bounds: Limbo.bounds,
        minCoords: minCoords,
        maxCoords: maxCoords
      });

      expect(coords[0]).toBeLessThan(maxCoords[0]);
      expect(coords[1]).toBeLessThan(maxCoords[1]);

      expect(coords[0]).toBeGreaterThan(minCoords[0]);
      expect(coords[1]).toBeGreaterThan(minCoords[1]);
    }
  });
});
