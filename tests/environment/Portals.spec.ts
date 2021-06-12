import Portals from '@/environment/Portals';
import LimboData from '@/config/limbo.json';
import { Vector3 } from 'three/src/math/Vector3';

describe('Portals', () => {
  const player = new Vector3();
  const portals = new Portals();

  test('Create', () => {
    expect(Portals).toBeDefined();
    expect(portals).toBeInstanceOf(Portals);
  });

  test('portalPassed', () => {
    const portalPassed = jest.fn(portals.portalPassed.bind(portals));

    player.set(0, 0, LimboData.portals[1][1]);
    portalPassed(player);
    expect(portalPassed).toHaveReturnedWith(false);

    player.set(LimboData.portals[0][0] - 1, 0, LimboData.portals[1][1] + 1);
    portalPassed(player);
    expect(portalPassed).toHaveReturnedWith(true);

    player.set(LimboData.portals[6][0] + 1, 0, LimboData.portals[1][1] + 1);
    portalPassed(player);
    expect(portalPassed).toHaveReturnedWith(true);

    player.set(0, 0, LimboData.portals[2][1]);
    portalPassed(player);
    expect(portalPassed).toHaveReturnedWith(false);

    player.set(LimboData.portals[2][0] - 1, 0, LimboData.portals[2][1] - 1);
    portalPassed(player);
    expect(portalPassed).toHaveReturnedWith(true);

    player.set(LimboData.portals[4][0] + 1, 0, LimboData.portals[2][1] - 1);
    portalPassed(player);
    expect(portalPassed).toHaveReturnedWith(true);
  });

  test('playerPosition', () => {
    expect(portals.playerPosition).toBeInstanceOf(Vector3);
  });
});
