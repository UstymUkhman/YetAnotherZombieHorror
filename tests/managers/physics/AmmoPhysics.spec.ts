import '../../globals';
import { Config } from '@/config';
import { Bounds } from '@/types.d';

import Limbo from '@/environment/Limbo';
import { Mesh } from 'three/src/objects/Mesh';

import { Vector3 } from 'three/src/math/Vector3';
import AmmoPhysics from '@/managers/physics/AmmoPhysics';

describe('AmmoPhysics', () => {
  const Physics = new AmmoPhysics();

  test('Create', () => {
    expect(Physics).toBeDefined();
    expect(Physics).toBeInstanceOf(Object);
  });

  test('createGround', () => {
    const createGround = jest.fn(Physics.createGround.bind(
      Physics, Limbo.minCoords, Limbo.maxCoords
    ));

    createGround();
    expect(createGround).toHaveReturnedWith(undefined);
  });

  test('createBounds', () => {
    const { position, height, sidewalkHeight } = Config.Limbo;

    const createBounds = jest.fn(Physics.createBounds.bind(Physics, {
      borders: Limbo.bounds, y: position.y, height
    }, {
      borders: Config.Limbo.sidewalk as Bounds,
      height: sidewalkHeight,
      y: sidewalkHeight / 2
    }));

    createBounds();
    expect(createBounds).toHaveReturnedWith(undefined);
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
