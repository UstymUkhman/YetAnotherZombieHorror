import { Vector3 } from 'three/src/math/Vector3';
import LevelData from '@/configs/level.json';
import Portals from '@/environment/Portals';

describe('Portals', () => {
  const player = new Vector3();
  const portals = new Portals();

  test('Create', () => {
    expect(Portals).toBeDefined();
    expect(portals).toBeInstanceOf(Portals);
  });

  test('portalPassed', () => {
    const portalPassed = jest.fn(portals.portalPassed.bind(portals));

    player.set(0, 0, LevelData.portals[1][1]);
    portalPassed(player);
    expect(portalPassed).toHaveReturnedWith(false);

    player.set(LevelData.portals[0][0] - 1, 0, LevelData.portals[1][1] + 1);
    portalPassed(player);
    expect(portalPassed).toHaveReturnedWith(true);

    player.set(LevelData.portals[6][0] + 1, 0, LevelData.portals[1][1] + 1);
    portalPassed(player);
    expect(portalPassed).toHaveReturnedWith(true);

    player.set(0, 0, LevelData.portals[2][1]);
    portalPassed(player);
    expect(portalPassed).toHaveReturnedWith(false);

    player.set(LevelData.portals[2][0] - 1, 0, LevelData.portals[2][1] - 1);
    portalPassed(player);
    expect(portalPassed).toHaveReturnedWith(true);

    player.set(LevelData.portals[4][0] + 1, 0, LevelData.portals[2][1] - 1);
    portalPassed(player);
    expect(portalPassed).toHaveReturnedWith(true);
  });

  test('playerPosition', () => {
    expect(portals.playerPosition).toBeInstanceOf(Vector3);
  });

  test('update', () => {
    (portals as unknown as Record<string, unknown>).material = {
      uniforms: { deltaTime: { value: 0.0 } }
    };

    const update = jest.fn(portals.update.bind(portals));
    update(0);
    expect(update).toHaveReturnedWith(undefined);
  });
});
