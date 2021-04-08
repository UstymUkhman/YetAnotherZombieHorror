import '../../globals';
import { Config } from '@/config';
import { Bounds } from '@/types.d';

import { Vector } from '@/utils/Vector';
import Level0 from '@/environment/Level0';
import { Line3 } from 'three/src/math/Line3';

import { Mesh } from 'three/src/objects/Mesh';
import { Vector3 } from 'three/src/math/Vector3';
import BVHPhysics from '@/managers/physics/BVHPhysics';

describe('BVHPhysics', () => {
  const Physics = new BVHPhysics();
  const player = new Mesh().add(new Mesh());

  player.userData = {
    segment: new Line3(new Vector3(), Vector.random()),
    height: Math.random(), radius: Math.random()
  };

  test('Create', () => {
    expect(Physics).toBeDefined();
    expect(Physics).toBeInstanceOf(Object);
  });

  test('createGround', () => {
    const createGround = jest.fn(Physics.createGround.bind(
      Physics, Level0.minCoords, Level0.maxCoords
    ));

    createGround();
    expect(createGround).toHaveReturnedWith(undefined);
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

  test('setPlayer', () => {
    const setPlayer = jest.fn(Physics.setPlayer.bind(
      Physics, player
    ));

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
