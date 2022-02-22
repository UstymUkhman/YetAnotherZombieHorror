import { Vector2 } from 'three/src/math/Vector2';
import Coords from '@/utils/Coords';

describe('Coords', () => {
  test('fillRandomLevelCoords', () => {
    const fillRandomLevelCoords = jest.fn(Coords.fillRandomLevelCoords);
    fillRandomLevelCoords();
    expect(fillRandomLevelCoords).toHaveReturnedWith(undefined);
  });

  test('addLevelCoords', () => {
    const addLevelCoords = jest.fn(Coords.addLevelCoords);
    addLevelCoords([0.0, 0.0]);
    expect(addLevelCoords).toHaveReturnedWith(false);
  });

  test('getRandomLevelCoords', () => {
    const player = new Vector2();
    const coords = Coords.getRandomLevelCoords(player);

    expect(coords).toBeInstanceOf(Array);
    expect(coords.length).toStrictEqual(2.0);

    expect(typeof coords[0]).toStrictEqual('number');
    expect(typeof coords[1]).toStrictEqual('number');
  });
});
