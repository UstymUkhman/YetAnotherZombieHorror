import { Vector2 } from '@three/math/Vector2';
import { Vector3 } from '@three/math/Vector3';

import Level0 from '@/config/level0.json';
import Camera from '@/config/camera.json';

import Player from '@/config/player.json';
import Enemy from '@/config/enemy.json';

import Pistol from '@/config/pistol.json';
import Rifle from '@/config/rifle.json';

import { Euler } from '@three/math/Euler';

declare const global: any;
global.PRODUCTION = false;
global.BUILD = '0.1.0';

import { Config } from '@/config';

describe('Settings', () => {
  test('Constants', () => {
    expect(typeof Config.colliders).toStrictEqual('boolean');
    expect(typeof Config.hitBoxes).toStrictEqual('boolean');
    expect(typeof Config.VERSION).toStrictEqual('string');

    expect(Config.freeCamera).toStrictEqual(false);
    expect(Config.DEBUG).toStrictEqual(true);
    expect(Config.APP).toStrictEqual(false);
  });

  test('Level0', () => {
    const levelPosition = new Vector3(...Level0.position);
    const levelScale = new Vector3(...Level0.scale);

    expect(Config.Level0.model).toStrictEqual('level0.glb');
    expect(Config.Level0.music).toStrictEqual('level0.mp3');

    expect(Config.Level0.skybox).toStrictEqual('level0');

    expect(Config.Level0.height).toStrictEqual(10);
    expect(Config.Level0.depth).toStrictEqual(100);

    expect(Config.Level0.scale).toBeInstanceOf(Vector3);
    expect(Config.Level0.scale).toStrictEqual(levelScale);

    expect(Config.Level0.position).toBeInstanceOf(Vector3);
    expect(Config.Level0.position).toStrictEqual(levelPosition);

    expect(Config.Level0.sidewalkHeight).toBeLessThan(Config.Level0.height);
    expect(Config.Level0.bounds.length).toBeGreaterThan(2);

    Config.Level0.bounds.forEach(
      bound => expect(bound.length).toStrictEqual(2)
    );
  });

  test('Player', () => {
    const animationKeys = Object.keys(Config.Player.animations);
    const playerPosition = new Vector3(...Player.position);
    const playerCollider = new Vector3(...Player.collider);
    const playerScale = new Vector3(...Player.scale);

    expect(Config.Player.scale).toBeInstanceOf(Vector3);
    expect(Config.Player.scale).toStrictEqual(playerScale);

    expect(Config.Player.model).toStrictEqual('player.glb');

    expect(Config.Player.position).toBeInstanceOf(Vector3);
    expect(Config.Player.position).toStrictEqual(playerPosition);

    expect(Config.Player.collider).toBeInstanceOf(Vector3);
    expect(Config.Player.collider).toStrictEqual(playerCollider);

    expect(Object.keys(Config.Player.sounds).length).toBeGreaterThan(0);
    expect(animationKeys.length).toBeGreaterThan(0);

    for (const animation of animationKeys) {
      const name = animation as keyof typeof Player.animations;
      expect(Config.Player.animations[name].length).toStrictEqual(4);
    }
  });

  test('Enemy', () => {
    const animationKeys = Object.keys(Config.Enemy.animations);
    const enemyPosition = new Vector3(...Enemy.position);
    const enemyCollider = new Vector3(...Enemy.collider);
    const enemyScale = new Vector3(...Enemy.scale);

    expect(Config.Enemy.scale).toBeInstanceOf(Vector3);
    expect(Config.Enemy.scale).toStrictEqual(enemyScale);

    expect(Config.Enemy.model).toStrictEqual('enemy.glb');

    expect(Config.Enemy.position).toBeInstanceOf(Vector3);
    expect(Config.Enemy.position).toStrictEqual(enemyPosition);

    expect(Config.Enemy.collider).toBeInstanceOf(Vector3);
    expect(Config.Enemy.collider).toStrictEqual(enemyCollider);

    expect(Object.keys(Config.Enemy.sounds).length).toBeGreaterThan(0);
    expect(animationKeys.length).toBeGreaterThan(0);

    for (const animation of animationKeys) {
      const name = animation as keyof typeof Enemy.animations;
      expect(Config.Enemy.animations[name].length).toStrictEqual(2);
    }
  });

  test('Pistol', () => {
    const pistolPosition = new Vector3(...Pistol.position);
    const pistolRotation = new Euler(...Pistol.rotation);

    const pistolSpread = new Vector2(...Pistol.spread);
    const pistolRecoil = new Vector2(...Pistol.recoil);
    const pistolScale = new Vector3(...Pistol.scale);

    expect(Object.keys(Config.Pistol.sounds).length).toBeGreaterThan(0);

    expect(Config.Pistol.position).toStrictEqual(pistolPosition);
    expect(Config.Pistol.position).toBeInstanceOf(Vector3);

    expect(Config.Pistol.rotation).toStrictEqual(pistolRotation);
    expect(Config.Pistol.rotation).toBeInstanceOf(Euler);

    expect(Config.Pistol.scale).toStrictEqual(pistolScale);
    expect(Config.Pistol.scale).toBeInstanceOf(Vector3);

    expect(Config.Pistol.spread).toStrictEqual(pistolSpread);
    expect(Config.Pistol.spread).toBeInstanceOf(Vector2);

    expect(Config.Pistol.recoil).toStrictEqual(pistolRecoil);
    expect(Config.Pistol.recoil).toBeInstanceOf(Vector2);

    expect(Config.Pistol.magazine).toStrictEqual(Infinity);
    expect(Config.Pistol.model).toStrictEqual('1911.glb');
    expect(Config.Pistol.ammo).toStrictEqual(Infinity);

    expect(Config.Pistol.damage).toBeGreaterThan(0);
    expect(Config.Pistol.speed).toBeGreaterThan(0);
  });

  test('Rifle', () => {
    const riflePosition = new Vector3(...Rifle.position);
    const rifleRotation = new Euler(...Rifle.rotation);

    const rifleSpread = new Vector2(...Rifle.spread);
    const rifleRecoil = new Vector2(...Rifle.recoil);
    const rifleScale = new Vector3(...Rifle.scale);

    expect(Object.keys(Config.Rifle.sounds).length).toBeGreaterThan(0);

    expect(Config.Rifle.position).toStrictEqual(riflePosition);
    expect(Config.Rifle.position).toBeInstanceOf(Vector3);

    expect(Config.Rifle.rotation).toStrictEqual(rifleRotation);
    expect(Config.Rifle.rotation).toBeInstanceOf(Euler);

    expect(Config.Rifle.scale).toStrictEqual(rifleScale);
    expect(Config.Rifle.scale).toBeInstanceOf(Vector3);

    expect(Config.Rifle.spread).toStrictEqual(rifleSpread);
    expect(Config.Rifle.spread).toBeInstanceOf(Vector2);

    expect(Config.Rifle.recoil).toStrictEqual(rifleRecoil);
    expect(Config.Rifle.recoil).toBeInstanceOf(Vector2);

    expect(Config.Rifle.model).toStrictEqual('AK47.glb');
    expect(Config.Rifle.magazine).toBeGreaterThan(0);

    expect(Config.Rifle.damage).toBeGreaterThan(0);
    expect(Config.Rifle.speed).toBeGreaterThan(0);
    expect(Config.Rifle.ammo).toStrictEqual(0);
  });

  test('Camera', () => {
    const cameraFPSPosition = new Vector3(...Camera.fps);
    const cameraTPSPosition = new Vector3(...Camera.tps);
    const cameraAimPosition = new Vector3(...Camera.aim);
    const cameraRunPosition = new Vector3(...Camera.run);

    expect(Config.Camera.fps).toStrictEqual(cameraFPSPosition);
    expect(Config.Camera.fps).toBeInstanceOf(Vector3);

    expect(Config.Camera.tps).toStrictEqual(cameraTPSPosition);
    expect(Config.Camera.tps).toBeInstanceOf(Vector3);

    expect(Config.Camera.aim).toStrictEqual(cameraAimPosition);
    expect(Config.Camera.aim).toBeInstanceOf(Vector3);

    expect(Config.Camera.run).toStrictEqual(cameraRunPosition);
    expect(Config.Camera.run).toBeInstanceOf(Vector3);
  });

  test('Frozen', () => {
    expect(Object.isFrozen(Config.Level0.scale)).toStrictEqual(true);
    expect(() => { delete (Config.Player as any).scale; }).toThrow(TypeError);
    expect(() => { (Config.Enemy as any).position = [0, 0, 0]; }).toThrow(TypeError);
  });
});
