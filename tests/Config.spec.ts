import { Config } from '@/config';
import { Euler } from 'three/src/math/Euler';

import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';

import Camera from '@/config/camera.json';
import Limbo from '@/config/limbo.json';

import Player from '@/config/player.json';
import Enemy from '@/config/enemy.json';

import Pistol from '@/config/pistol.json';
import Rifle from '@/config/rifle.json';

describe('Settings', () => {
  test('Constants', () => {
    expect(typeof Config.colliders).toStrictEqual('boolean');
    expect(typeof Config.hitBoxes).toStrictEqual('boolean');
    expect(typeof Config.VERSION).toStrictEqual('string');

    expect(Config.freeCamera).toStrictEqual(false);
    expect(Config.DEBUG).toStrictEqual(true);
    expect(Config.APP).toStrictEqual(false);
  });

  test('Settings', () => {
    expect(typeof Config.Settings.ammoPhysics).toStrictEqual('boolean');
    expect(typeof Config.Settings.fpCamera).toStrictEqual('boolean');
  });

  test('Camera.fps', () => {
    const cameraTPSIdlePosition = new Vector3(...Camera.fps.idle);
    const cameraTPSAimPosition = new Vector3(...Camera.fps.aim);

    expect(Config.Camera.fps.idle).toStrictEqual(cameraTPSIdlePosition);
    expect(Config.Camera.fps.idle).toBeInstanceOf(Vector3);

    expect(Config.Camera.fps.run).toStrictEqual(cameraTPSIdlePosition);
    expect(Config.Camera.fps.run).toBeInstanceOf(Vector3);

    expect(Config.Camera.fps.aim).toStrictEqual(cameraTPSAimPosition);
    expect(Config.Camera.fps.aim).toBeInstanceOf(Vector3);
  });

  test('Camera.tps', () => {
    const cameraTPSIdlePosition = new Vector3(...Camera.tps.idle);
    const cameraTPSRunPosition = new Vector3(...Camera.tps.run);
    const cameraTPSAimPosition = new Vector3(...Camera.tps.aim);

    expect(Config.Camera.tps.idle).toStrictEqual(cameraTPSIdlePosition);
    expect(Config.Camera.tps.idle).toBeInstanceOf(Vector3);

    expect(Config.Camera.tps.run).toStrictEqual(cameraTPSRunPosition);
    expect(Config.Camera.tps.run).toBeInstanceOf(Vector3);

    expect(Config.Camera.tps.aim).toStrictEqual(cameraTPSAimPosition);
    expect(Config.Camera.tps.aim).toBeInstanceOf(Vector3);
  });

  test('Limbo', () => {
    const levelPosition = new Vector3(...Limbo.position);
    const levelScale = new Vector3(...Limbo.scale);

    expect(Config.Limbo.model).toStrictEqual('limbo.glb');
    expect(Config.Limbo.music).toStrictEqual('limbo.mp3');

    expect(Config.Limbo.skybox).toStrictEqual('limbo');

    expect(Config.Limbo.height).toStrictEqual(10);
    expect(Config.Limbo.depth).toStrictEqual(200);

    expect(Config.Limbo.scale).toBeInstanceOf(Vector3);
    expect(Config.Limbo.scale).toStrictEqual(levelScale);

    expect(Config.Limbo.position).toBeInstanceOf(Vector3);
    expect(Config.Limbo.position).toStrictEqual(levelPosition);

    expect(Config.Limbo.bounds.length).toStrictEqual(Config.Limbo.sidewalk.length);
    expect(Config.Limbo.sidewalkHeight).toBeLessThan(Config.Limbo.height);
    expect(Config.Limbo.portals.length).toStrictEqual(8);

    Config.Limbo.sidewalk.forEach(coords =>
      expect(coords.length).toStrictEqual(2)
    );

    Config.Limbo.portals.forEach(coords =>
      expect(coords.length).toStrictEqual(2)
    );

    Config.Limbo.bounds.forEach(coords =>
      expect(coords.length).toStrictEqual(2)
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

    expect(typeof Config.Rifle.maxStock).toStrictEqual('number');
    expect(typeof Config.Rifle.ammo).toStrictEqual('number');

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

    expect(Config.Rifle.spread).toBeInstanceOf(Vector2);
  });

  test('Frozen', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    expect(Object.isFrozen(Config.Limbo.scale)).toStrictEqual(true);
    expect(() => { delete (Config.Player as any).scale; }).toThrow(TypeError);
    expect(() => { (Config.Enemy as any).position = [0, 0, 0]; }).toThrow(TypeError);
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });
});
