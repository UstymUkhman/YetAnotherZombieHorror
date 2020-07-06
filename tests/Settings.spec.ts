import { Vector3 } from '@three/math/Vector3';
import Player from '@/settings/player.json';
import Enemy from '@/settings/enemy.json';

declare const global: any;
global.PRODUCTION = false;
global.BUILD = '0.1.0';

import { Settings } from '@/settings';

describe('Settings', () => {
  test('Constants', () => {
    expect(Settings.APP).toStrictEqual(false);
    expect(Settings.DEBUG).toStrictEqual(true);
    expect(typeof Settings.VERSION).toStrictEqual('string');
  });

  test('Characters', () => {
    const playerPosition = new Vector3(...Player.position);
    const enemyScale = new Vector3(...Enemy.scale);

    expect(Object.keys(Settings.Player.animations).length).toBeGreaterThan(0);
    expect(Settings.Player.position).toStrictEqual(playerPosition);
    expect(Settings.Player.model).toStrictEqual('player.glb');
    expect(Settings.Player.position).toBeInstanceOf(Vector3);

    expect(Object.keys(Settings.Enemy.sounds).length).toBeGreaterThan(0);
    expect(Settings.Enemy.model).toStrictEqual('enemy.glb');
    expect(Settings.Enemy.scale).toStrictEqual(enemyScale);
    expect(Settings.Enemy.scale).toBeInstanceOf(Vector3);
  });

  test('Frozen', () => {
    expect(() => { Settings.Level0.scale.x = 0; }).toThrow(TypeError);
    expect(() => { delete (Settings.Player as any).scale; }).toThrow(TypeError);
    expect(() => { (Settings.Enemy as any).position = [0, 0, 0]; }).toThrow(TypeError);
  });
});
