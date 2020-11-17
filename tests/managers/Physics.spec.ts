import '../globals';
import { Bounds } from '@/types';
import { Config } from '@/config';

import Physics from '@/managers/Physics';
import Level0 from '@/environment/Level0';

import { Mesh } from '@three/objects/Mesh';
import { Vector3 } from '@three/math/Vector3';

describe('Physics', () => {
  test('Create', () => {
    expect(Physics).toBeDefined();
    expect(Physics).toBeInstanceOf(Object);
  });

  test('createBounds', () => {
    const { position, height, sidewalkHeight } = Config.Level0;

    const createBounds = jest.fn(Physics.createBounds.bind(Physics, {
      borders: Level0.bounds, y: position.y, height
    }, {
      borders: Config.Level0.sidewalk as Bounds,
      height: sidewalkHeight,
      y: sidewalkHeight / 2
    }));

    createBounds();
    expect(createBounds).toHaveReturnedWith(undefined);
  });

  test('createGround', () => {
    const createGround = jest.fn(Physics.createGround.bind(
      Physics, Level0.minCoords, Level0.maxCoords
    ));

    createGround();
    expect(createGround).toHaveReturnedWith(undefined);
  });

  test('setPlayer', () => {
    const setPlayer = jest.fn(Physics.setPlayer.bind(Physics, new Mesh()));

    setPlayer();
    expect(setPlayer).toHaveReturnedWith(undefined);
  });

  test('move', () => {
    const move = jest.fn(Physics.move.bind(Physics, new Vector3()));

    move();
    expect(move).toHaveReturnedWith(undefined);
  });

  test('stop', () => {
    const stop = jest.fn(Physics.stop.bind(Physics));
    stop();
    expect(stop).toHaveReturnedWith(undefined);
  });

  test('update', () => {
    const update = jest.fn(Physics.update.bind(Physics, 0));
    update();
    expect(update).toHaveReturnedWith(undefined);
  });

  test('destroy', () => {
    const destroy = jest.fn(Physics.destroy.bind(Physics));
    destroy();
    expect(destroy).toHaveReturnedWith(undefined);
  });

  test('pause', () => {
    const pause = jest.fn(() => Physics.pause = true);
    pause();
    expect(pause).toHaveReturnedWith(true);
  });
});
