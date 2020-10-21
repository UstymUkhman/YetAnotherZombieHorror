import { Vector2 } from '@three/math/Vector2';
import { Vector3 } from '@three/math/Vector3';
import { Euler } from '@three/math/Euler';

import Level0 from '@/settings/level0.json';
import Pistol from '@/settings/pistol.json';

import Player from '@/settings/player.json';
import Enemy from '@/settings/enemy.json';

declare const global: any;
global.PRODUCTION = false;
global.BUILD = '0.1.0';

import { Settings } from '@/settings';

describe('Settings', () => {
  test('Constants', () => {
    expect(typeof Settings.colliders).toStrictEqual('boolean');
    expect(typeof Settings.hitBoxes).toStrictEqual('boolean');
    expect(typeof Settings.VERSION).toStrictEqual('string');

    expect(Settings.freeCamera).toStrictEqual(false);
    expect(Settings.DEBUG).toStrictEqual(true);
    expect(Settings.APP).toStrictEqual(false);
  });

  test('Level0', () => {
    const levelPosition = new Vector3(...Level0.position);
    const levelScale = new Vector3(...Level0.scale);

    expect(Settings.Level0.model).toStrictEqual('level0.glb');
    expect(Settings.Level0.music).toStrictEqual('level0.mp3');

    expect(Settings.Level0.skybox).toStrictEqual('level0');

    expect(Settings.Level0.height).toStrictEqual(10);
    expect(Settings.Level0.depth).toStrictEqual(100);

    expect(Settings.Level0.scale).toBeInstanceOf(Vector3);
    expect(Settings.Level0.scale).toStrictEqual(levelScale);

    expect(Settings.Level0.position).toBeInstanceOf(Vector3);
    expect(Settings.Level0.position).toStrictEqual(levelPosition);

    expect(Settings.Level0.sidewalkHeight).toBeLessThan(Settings.Level0.height);
    expect(Settings.Level0.bounds.length).toBeGreaterThan(2);

    Settings.Level0.bounds.forEach(
      bound => expect(bound.length).toStrictEqual(2)
    );
  });

  test('Player', () => {
    const animationKeys = Object.keys(Settings.Player.animations);
    const playerPosition = new Vector3(...Player.position);
    const playerScale = new Vector3(...Player.scale);

    expect(Settings.Player.scale).toBeInstanceOf(Vector3);
    expect(Settings.Player.scale).toStrictEqual(playerScale);

    expect(Settings.Player.model).toStrictEqual('player.glb');

    expect(Settings.Player.position).toBeInstanceOf(Vector3);
    expect(Settings.Player.position).toStrictEqual(playerPosition);

    expect(Settings.Player.collider).toStrictEqual(Player.collider);
    expect(typeof Settings.Player.collider).toStrictEqual('number');

    expect(Object.keys(Settings.Player.sounds).length).toBeGreaterThan(0);
    expect(animationKeys.length).toBeGreaterThan(0);

    for (const animation of animationKeys) {
      const name = animation as keyof typeof Player.animations;
      expect(Settings.Player.animations[name].length).toStrictEqual(2);
    }
  });

  test('Enemy', () => {
    const animationKeys = Object.keys(Settings.Enemy.animations);
    const enemyPosition = new Vector3(...Enemy.position);
    const enemyScale = new Vector3(...Enemy.scale);

    expect(Settings.Enemy.scale).toBeInstanceOf(Vector3);
    expect(Settings.Enemy.scale).toStrictEqual(enemyScale);

    expect(Settings.Enemy.model).toStrictEqual('enemy.glb');

    expect(Settings.Enemy.position).toBeInstanceOf(Vector3);
    expect(Settings.Enemy.position).toStrictEqual(enemyPosition);

    expect(Settings.Enemy.collider).toStrictEqual(Enemy.collider);
    expect(typeof Settings.Enemy.collider).toStrictEqual('number');

    expect(Object.keys(Settings.Enemy.sounds).length).toBeGreaterThan(0);
    expect(animationKeys.length).toBeGreaterThan(0);

    for (const animation of animationKeys) {
      const name = animation as keyof typeof Enemy.animations;
      expect(Settings.Enemy.animations[name].length).toStrictEqual(2);
    }
  });

  test('Pistol', () => {
    const pistolPosition = new Vector3(...Pistol.position);
    const pistolRotation = new Euler(...Pistol.rotation);

    const pistolSpread = new Vector2(...Pistol.spread);
    const pistolRecoil = new Vector2(...Pistol.recoil);
    const pistolScale = new Vector3(...Pistol.scale);

    expect(Object.keys(Settings.Pistol.sounds).length).toBeGreaterThan(0);

    expect(Settings.Pistol.position).toStrictEqual(pistolPosition);
    expect(Settings.Pistol.position).toBeInstanceOf(Vector3);

    expect(Settings.Pistol.rotation).toStrictEqual(pistolRotation);
    expect(Settings.Pistol.rotation).toBeInstanceOf(Euler);

    expect(Settings.Pistol.scale).toStrictEqual(pistolScale);
    expect(Settings.Pistol.scale).toBeInstanceOf(Vector3);

    expect(Settings.Pistol.spread).toStrictEqual(pistolSpread);
    expect(Settings.Pistol.spread).toBeInstanceOf(Vector2);

    expect(Settings.Pistol.recoil).toStrictEqual(pistolRecoil);
    expect(Settings.Pistol.recoil).toBeInstanceOf(Vector2);

    expect(Settings.Pistol.magazine).toStrictEqual(Infinity);
    expect(Settings.Pistol.model).toStrictEqual('1911.glb');
    expect(Settings.Pistol.ammo).toStrictEqual(Infinity);

    expect(Settings.Pistol.damage).toBeGreaterThan(0);
    expect(Settings.Pistol.speed).toBeGreaterThan(0);
  });

  test('Frozen', () => {
    expect(Object.isFrozen(Settings.Level0.scale)).toStrictEqual(true);
    expect(() => { delete (Settings.Player as any).scale; }).toThrow(TypeError);
    expect(() => { (Settings.Enemy as any).position = [0, 0, 0]; }).toThrow(TypeError);
  });
});
