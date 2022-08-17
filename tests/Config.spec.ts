import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { Euler } from 'three/src/math/Euler';

import Camera from '@/configs/camera.json';
import Level from '@/configs/level.json';

import Player from '@/configs/player.json';
import Enemy from '@/configs/enemy.json';

import Pistol from '@/configs/pistol.json';
import Rifle from '@/configs/rifle.json';
import Configs from '@/configs';

describe('Configs', () => {
  test('Constants', () => {
    expect(typeof Configs.offscreen).toStrictEqual('boolean');
    expect(typeof Configs.worker).toStrictEqual('boolean');

    expect(Configs.offscreen).toStrictEqual(false);
    expect(Configs.worker).toStrictEqual(false);
    expect(Configs.APP).toStrictEqual(false);
  });

  test('RandomCoords', () => {
    expect(Configs.RandomCoords.playerDistance).toBeGreaterThan(0.0);
    expect(Configs.RandomCoords.boundOffset).toBeGreaterThan(0.0);
    expect(Configs.RandomCoords.boundOffset).toBeLessThan(1.0);
    expect(Configs.RandomCoords.ammount).toBeGreaterThanOrEqual(5.0);
    expect(Configs.RandomCoords.ammount).toBeLessThanOrEqual(100.0);
  });

  test('Level', () => {
    const levelPosition = new Vector3(...Level.position);
    const levelScale = new Vector3(...Level.scale);

    expect(Configs.Level.height).toStrictEqual(10);
    expect(Configs.Level.depth).toStrictEqual(250);

    expect(Configs.Level.scale).toBeInstanceOf(Vector3);
    expect(Configs.Level.scale).toStrictEqual(levelScale);

    expect(Configs.Level.position).toBeInstanceOf(Vector3);
    expect(Configs.Level.position).toStrictEqual(levelPosition);

    expect(Configs.Level.bounds.length).toStrictEqual(Configs.Level.sidewalk.length);
    expect(Configs.Level.portalsOffset).toStrictEqual(Configs.Level.portalsOffset);
    expect(Configs.Level.sidewalkHeight).toBeLessThan(Configs.Level.height);

    expect(Configs.Level.music).toStrictEqual('Day Of The Dead.mp3');
    expect(typeof Configs.Level.fogDensity).toStrictEqual('number');

    expect(Configs.Level.model).toStrictEqual('level.glb');
    expect(Configs.Level.cloud).toStrictEqual('cloud.png');

    expect(Configs.Level.portals.length).toStrictEqual(8);
    expect(Configs.Level.fogDensity).toBeGreaterThan(0.0);

    expect(Configs.Level.skybox).toStrictEqual('level');
    expect(Configs.Level.ambient).toContain('.mp3');

    Configs.Level.sidewalk.forEach(coords =>
      expect(coords.length).toStrictEqual(2)
    );

    Configs.Level.portals.forEach(coords =>
      expect(coords.length).toStrictEqual(2)
    );

    Configs.Level.bounds.forEach(coords =>
      expect(coords.length).toStrictEqual(2)
    );

    Configs.Level.lighting.forEach(sound =>
      expect(sound).toContain('.mp3')
    );

    Configs.Level.rain.forEach(drop =>
      expect(drop).toContain('.png')
    );
  });

  test('Camera.fps', () => {
    const cameraTPSIdlePosition = new Vector3(...Camera.fps.idle);
    const cameraTPSAimPosition = new Vector3(...Camera.fps.aim);

    expect(Configs.Camera.fps.idle).toStrictEqual(cameraTPSIdlePosition);
    expect(Configs.Camera.fps.idle).toBeInstanceOf(Vector3);

    expect(Configs.Camera.fps.run).toStrictEqual(cameraTPSIdlePosition);
    expect(Configs.Camera.fps.run).toBeInstanceOf(Vector3);

    expect(Configs.Camera.fps.aim).toStrictEqual(cameraTPSAimPosition);
    expect(Configs.Camera.fps.aim).toBeInstanceOf(Vector3);
  });

  test('Camera.tps', () => {
    const cameraTPSIdlePosition = new Vector3(...Camera.tps.idle);
    const cameraTPSRunPosition = new Vector3(...Camera.tps.run);
    const cameraTPSAimPosition = new Vector3(...Camera.tps.aim);

    expect(Configs.Camera.tps.idle).toStrictEqual(cameraTPSIdlePosition);
    expect(Configs.Camera.tps.idle).toBeInstanceOf(Vector3);

    expect(Configs.Camera.tps.run).toStrictEqual(cameraTPSRunPosition);
    expect(Configs.Camera.tps.run).toBeInstanceOf(Vector3);

    expect(Configs.Camera.tps.aim).toStrictEqual(cameraTPSAimPosition);
    expect(Configs.Camera.tps.aim).toBeInstanceOf(Vector3);
  });

  test('Player', () => {
    const animationKeys = Object.keys(Configs.Player.animations);
    const playerPosition = new Vector3(...Player.position);
    const playerCollider = new Vector3(...Player.collider);
    const playerScale = new Vector3(...Player.scale);

    expect(Configs.Player.scale).toBeInstanceOf(Vector3);
    expect(Configs.Player.scale).toStrictEqual(playerScale);

    expect(Configs.Player.model).toStrictEqual('player.glb');

    expect(Configs.Player.position).toBeInstanceOf(Vector3);
    expect(Configs.Player.position).toStrictEqual(playerPosition);

    expect(Configs.Player.collider).toBeInstanceOf(Vector3);
    expect(Configs.Player.collider).toStrictEqual(playerCollider);

    expect(Object.keys(Configs.Player.sounds).length).toBeGreaterThan(0);
    expect(animationKeys.length).toBeGreaterThan(0);

    for (const animation of animationKeys) {
      const name = animation as keyof typeof Player.animations;
      expect(Configs.Player.animations[name].length).toStrictEqual(4);
    }
  });

  test('Enemy', () => {
    const animationKeys = Object.keys(Configs.Enemy.animations);
    const enemyPosition = new Vector3(...Enemy.position);
    const enemyCollider = new Vector3(...Enemy.collider);
    const enemyScale = new Vector3(...Enemy.scale);

    expect(Configs.Enemy.scale).toBeInstanceOf(Vector3);
    expect(Configs.Enemy.scale).toStrictEqual(enemyScale);

    expect(Configs.Enemy.model).toStrictEqual('enemy.glb');

    expect(Configs.Enemy.position).toBeInstanceOf(Vector3);
    expect(Configs.Enemy.position).toStrictEqual(enemyPosition);

    expect(Configs.Enemy.collider).toBeInstanceOf(Vector3);
    expect(Configs.Enemy.collider).toStrictEqual(enemyCollider);

    expect(Object.keys(Configs.Enemy.sounds).length).toBeGreaterThan(0);
    expect(animationKeys.length).toBeGreaterThan(0);

    for (const animation of animationKeys) {
      const name = animation as keyof typeof Enemy.animations;
      expect(Configs.Enemy.animations[name].length).toStrictEqual(4);
    }
  });

  test('Pistol', () => {
    const pistolPosition = new Vector3(...Pistol.position);
    const pistolRotation = new Euler(...Pistol.rotation);

    const pistolSpread = new Vector2(...Pistol.spread);
    const pistolRecoil = new Vector2(...Pistol.recoil);
    const pistolScale = new Vector3(...Pistol.scale);

    expect(Object.keys(Configs.Pistol.sounds).length).toBeGreaterThan(0);

    expect(Configs.Pistol.textures).toStrictEqual(
      Configs.Pistol.model.slice(0, Configs.Pistol.model.indexOf('.'))
    );

    expect(typeof Configs.Pistol.damage.head).toStrictEqual('number');
    expect(Configs.Pistol.damage.head).toBeLessThanOrEqual(100);
    expect(Configs.Pistol.damage.head).toBeGreaterThan(0);

    expect(typeof Configs.Pistol.damage.body).toStrictEqual('number');
    expect(Configs.Pistol.damage.body).toBeLessThanOrEqual(100);
    expect(Configs.Pistol.damage.body).toBeGreaterThan(0);

    expect(typeof Configs.Pistol.damage.leg).toStrictEqual('number');
    expect(Configs.Pistol.damage.leg).toBeLessThanOrEqual(100);
    expect(Configs.Pistol.damage.leg).toBeGreaterThan(0);

    expect(typeof Configs.Pistol.headshot).toStrictEqual('number');
    expect(Configs.Pistol.headshot).toBeLessThanOrEqual(1.0);
    expect(Configs.Pistol.headshot).toBeGreaterThan(0.0);

    expect(Configs.Pistol.position).toStrictEqual(pistolPosition);
    expect(Configs.Pistol.position).toBeInstanceOf(Vector3);

    expect(Configs.Pistol.rotation).toStrictEqual(pistolRotation);
    expect(Configs.Pistol.rotation).toBeInstanceOf(Euler);

    expect(Configs.Pistol.scale).toStrictEqual(pistolScale);
    expect(Configs.Pistol.scale).toBeInstanceOf(Vector3);

    expect(Configs.Pistol.spread).toStrictEqual(pistolSpread);
    expect(Configs.Pistol.spread).toBeInstanceOf(Vector2);

    expect(Configs.Pistol.recoil).toStrictEqual(pistolRecoil);
    expect(Configs.Pistol.recoil).toBeInstanceOf(Vector2);

    expect(Configs.Pistol.magazine).toStrictEqual(Infinity);
    expect(Configs.Pistol.model).toStrictEqual('1911.glb');
    expect(Configs.Pistol.ammo).toStrictEqual(Infinity);
  });

  test('Pistol.bullet', () => {
    const bulletPosition = new Vector3(...Pistol.bullet.position);

    expect(Configs.Pistol.bullet.position).toStrictEqual(bulletPosition);
    expect(Configs.Pistol.bullet.position).toBeInstanceOf(Vector3);
    expect(Configs.Pistol.bullet.lifeTime).toBeGreaterThan(0);

    expect(Configs.Pistol.bullet.speed).toBeGreaterThan(0);
    expect(Configs.Pistol.bullet.scale).toBeGreaterThan(0);
  });

  test('Pistol.fire', () => {
    const particlesAmount = [...Pistol.fire.particles];
    const firePosition = new Vector2(...Pistol.fire.position);

    expect(Configs.Pistol.fire.particles).toStrictEqual(particlesAmount);
    expect(Configs.Pistol.fire.position).toStrictEqual(firePosition);

    expect(Configs.Pistol.fire.position).toBeInstanceOf(Vector2);
    expect(Configs.Pistol.fire.particles).toBeInstanceOf(Array);

    expect(Configs.Pistol.fire.intensity).toBeGreaterThan(0);
    expect(Configs.Pistol.fire.velocity).toBeGreaterThan(0);
    expect(Configs.Pistol.fire.scale).toBeGreaterThan(0);
  });

  test('Rifle', () => {
    const rifleSpinePosition = new Vector3(...Rifle.spinePosition);
    const rifleSpineRotation = new Euler(...Rifle.spineRotation);

    const riflePosition = new Vector3(...Rifle.position);
    const rifleRotation = new Euler(...Rifle.rotation);

    const rifleSpread = new Vector2(...Rifle.spread);
    const rifleRecoil = new Vector2(...Rifle.recoil);
    const rifleScale = new Vector3(...Rifle.scale);

    expect(Object.keys(Configs.Rifle.sounds).length).toBeGreaterThan(0);

    expect(Configs.Rifle.textures).toStrictEqual(
      Configs.Rifle.model.slice(0, Configs.Rifle.model.indexOf('.'))
    );

    expect(typeof Configs.Rifle.damage.head).toStrictEqual('number');
    expect(Configs.Rifle.damage.head).toBeLessThanOrEqual(100);
    expect(Configs.Rifle.damage.head).toBeGreaterThan(0);

    expect(typeof Configs.Rifle.damage.body).toStrictEqual('number');
    expect(Configs.Rifle.damage.body).toBeLessThanOrEqual(100);
    expect(Configs.Rifle.damage.body).toBeGreaterThan(0);

    expect(typeof Configs.Rifle.damage.leg).toStrictEqual('number');
    expect(Configs.Rifle.damage.leg).toBeLessThanOrEqual(100);
    expect(Configs.Rifle.damage.leg).toBeGreaterThan(0);

    expect(typeof Configs.Rifle.headshot).toStrictEqual('number');
    expect(Configs.Rifle.headshot).toBeLessThanOrEqual(1.0);
    expect(Configs.Rifle.headshot).toBeGreaterThan(0.0);

    expect(typeof Configs.Rifle.maxStock).toStrictEqual('number');
    expect(typeof Configs.Rifle.ammo).toStrictEqual('number');

    expect(Configs.Rifle.spinePosition).toStrictEqual(rifleSpinePosition);
    expect(Configs.Rifle.spinePosition).toBeInstanceOf(Vector3);

    expect(Configs.Rifle.spineRotation).toStrictEqual(rifleSpineRotation);
    expect(Configs.Rifle.spineRotation).toBeInstanceOf(Euler);

    expect(Configs.Rifle.position).toStrictEqual(riflePosition);
    expect(Configs.Rifle.position).toBeInstanceOf(Vector3);

    expect(Configs.Rifle.rotation).toStrictEqual(rifleRotation);
    expect(Configs.Rifle.rotation).toBeInstanceOf(Euler);

    expect(Configs.Rifle.scale).toStrictEqual(rifleScale);
    expect(Configs.Rifle.scale).toBeInstanceOf(Vector3);

    expect(Configs.Rifle.spread).toStrictEqual(rifleSpread);
    expect(Configs.Rifle.spread).toBeInstanceOf(Vector2);

    expect(Configs.Rifle.recoil).toStrictEqual(rifleRecoil);
    expect(Configs.Rifle.recoil).toBeInstanceOf(Vector2);

    expect(Configs.Rifle.model).toStrictEqual('AK47.glb');
    expect(Configs.Rifle.spread).toBeInstanceOf(Vector2);
    expect(Configs.Rifle.magazine).toBeGreaterThan(0);
  });

  test('Rifle.bullet', () => {
    const bulletPosition = new Vector3(...Rifle.bullet.position);

    expect(Configs.Rifle.bullet.position).toStrictEqual(bulletPosition);
    expect(Configs.Rifle.bullet.position).toBeInstanceOf(Vector3);
    expect(Configs.Rifle.bullet.lifeTime).toBeGreaterThan(0);

    expect(Configs.Rifle.bullet.speed).toBeGreaterThan(0);
    expect(Configs.Rifle.bullet.scale).toBeGreaterThan(0);
  });

  test('Rifle.fire', () => {
    const particlesAmount = [...Rifle.fire.particles];
    const firePosition = new Vector2(...Rifle.fire.position);

    expect(Configs.Rifle.fire.particles).toStrictEqual(particlesAmount);
    expect(Configs.Rifle.fire.position).toStrictEqual(firePosition);

    expect(Configs.Rifle.fire.position).toBeInstanceOf(Vector2);
    expect(Configs.Rifle.fire.particles).toBeInstanceOf(Array);

    expect(Configs.Rifle.fire.intensity).toBeGreaterThan(0);
    expect(Configs.Rifle.fire.velocity).toBeGreaterThan(0);
    expect(Configs.Rifle.fire.scale).toBeGreaterThan(0);
  });

  test('Frozen', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    expect(Object.isFrozen(Configs.Level.scale)).toStrictEqual(true);
    expect(() => { delete (Configs.Player as any).scale; }).toThrow(TypeError);
    expect(() => { (Configs.Enemy as any).position = [0, 0, 0]; }).toThrow(TypeError);
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });
});
