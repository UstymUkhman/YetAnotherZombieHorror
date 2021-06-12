import { Mesh } from 'three/src/objects/Mesh';
import PhysicsManager from '@/managers/physics';
import { Vector3 } from 'three/src/math/Vector3';
import PhysicsWorld from '@/managers/physics/PhysicsWorld';

describe('PhysicsManager', () => {
  test('Create', () => {
    expect(PhysicsManager).toBeInstanceOf(PhysicsWorld);
  });

  test('teleportCollider', () => {
    const player = new Mesh();
    const setPlayer = jest.fn(PhysicsManager.setPlayer.bind(PhysicsManager, player));
    const teleportCollider = jest.fn(PhysicsManager.teleportCollider.bind(PhysicsManager, player.uuid));

    setPlayer();
    teleportCollider();

    expect(teleportCollider).toHaveReturnedWith(undefined);
  });

  test('setPlayer', () => {
    const setPlayer = jest.fn(PhysicsManager.setPlayer.bind(PhysicsManager, new Mesh()));

    setPlayer();
    expect(setPlayer).toHaveReturnedWith(undefined);
  });

  test('move', () => {
    const move = jest.fn(PhysicsManager.move.bind(PhysicsManager, new Vector3()));

    move();
    expect(move).toHaveReturnedWith(undefined);
  });

  test('update', () => {
    const update = jest.fn(PhysicsManager.update.bind(PhysicsManager, 0));
    update();
    expect(update).toHaveReturnedWith(undefined);
  });

  test('pause', () => {
    const pause = jest.fn(() => PhysicsManager.pause = true);
    pause();
    expect(pause).toHaveReturnedWith(true);
  });

  test('destroy', () => {
    const destroy = jest.fn(PhysicsManager.destroy.bind(PhysicsManager));
    destroy();
    expect(destroy).toHaveReturnedWith(undefined);
  });

  test('stop', () => {
    const stop = jest.fn(PhysicsManager.stop.bind(PhysicsManager));
    stop();
    expect(stop).toHaveReturnedWith(undefined);
  });
});
