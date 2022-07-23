import type { LevelBounds } from '@/scenes/types';
import { Vector3 } from 'three/src/math/Vector3';
import AmmoPhysics from '@/physics/AmmoPhysics';

import { Mesh } from 'three/src/objects/Mesh';
import LevelScene from '@/scenes/LevelScene';
import Configs from '@/configs';

describe('AmmoPhysics', () => {
  const Physics = new AmmoPhysics();
  const player = new Mesh();

  test('Create', () => {
    expect(Physics).toBeDefined();
    expect(Physics).toBeInstanceOf(Object);
  });

  test('createGround', () => {
    const createGround = jest.fn(Physics.createGround.bind(
      Physics, LevelScene.minCoords, LevelScene.maxCoords
    ));

    createGround();
    expect(createGround).toHaveReturnedWith(undefined);
  });

  test('createBounds', () => {
    const { position, height, sidewalkHeight } = Configs.Level;

    const createBounds = jest.fn(Physics.createBounds.bind(Physics, {
      borders: LevelScene.bounds, y: position.y, height
    }, {
      borders: Configs.Level.sidewalk as LevelBounds,
      height: sidewalkHeight,
      y: sidewalkHeight / 2
    }));

    createBounds();
    expect(createBounds).toHaveReturnedWith(undefined);
  });

  test('setCharacter', () => {
    const setCharacter = jest.fn(Physics.setCharacter.bind(Physics, new Mesh()));

    setCharacter();
    expect(setCharacter).toHaveReturnedWith(undefined);
  });

  test('teleportCollider', () => {
    const setCharacter = jest.fn(Physics.setCharacter.bind(Physics, player));
    const teleportCollider = jest.fn(Physics.teleportCollider.bind(Physics, player.uuid));

    setCharacter();
    teleportCollider();

    expect(teleportCollider).toHaveReturnedWith(undefined);
  });

  test('move', () => {
    const move = jest.fn(Physics.move.bind(Physics));
    move(player.uuid, new Vector3());
    expect(move).toHaveReturnedWith(undefined);
  });

  test('stop', () => {
    const stop = jest.fn(Physics.stop.bind(Physics));
    stop(player.uuid);
    expect(stop).toHaveReturnedWith(undefined);
  });

  test('update', () => {
    const update = jest.fn(Physics.update.bind(Physics));
    update(0);
    expect(update).toHaveReturnedWith(undefined);
  });

  test('remove', () => {
    const remove = jest.fn(Physics.remove.bind(Physics));
    remove(player.uuid);
    expect(remove).toHaveReturnedWith(undefined);
  });

  test('dispose', () => {
    const dispose = jest.fn(Physics.dispose.bind(Physics));
    dispose();
    expect(dispose).toHaveReturnedWith(undefined);
  });

  test('pause', () => {
    const pause = jest.fn(() => Physics.pause = true);
    pause();
    expect(pause).toHaveReturnedWith(true);
  });
});
