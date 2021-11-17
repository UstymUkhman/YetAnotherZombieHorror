import type { CharacterMove } from '@/characters/types';
import SettingsData from '@/configs/settings.json';

import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';

import CameraData from '@/configs/camera.json';
import LevelData from '@/configs/level.json';

import PlayerData from '@/configs/player.json';
import EnemyData from '@/configs/enemy.json';

import PistolData from '@/configs/pistol.json';
import RifleData from '@/configs/rifle.json';

import { Euler } from 'three/src/math/Euler';
import deepFreeze from '@/utils/deepFreeze';

namespace Configs
{
  export type OffscreenCanvas = HTMLCanvasElement & { transferControlToOffscreen: () => Transferable };

  const parseCharacterMoves = (animations: CharacterAnimations): CharacterMoves =>
    Object.assign({}, ...Object.keys(animations).map(animation => ({ [animation]: {
      speed: animations[animation][0],

      direction: {
        z0: animations[animation][1],
        x0: animations[animation][2],
        x1: animations[animation][3]
      }
    }})
  ));

  const playerMoves = PlayerData.animations as unknown as CharacterAnimations;
  const enemyMoves = EnemyData.animations as unknown as CharacterAnimations;
  export const APP = navigator.userAgent.toLowerCase().includes('electron');

  type CharacterAnimations = Record<string, Readonly<Array<number>>>;
  export const BASE_PATH = (PRODUCTION || Configs.APP) && '.' || '';
  const getAmmo = (value: number) => value < 0 ? Infinity : value;

  type CharacterMoves = { [key: string]: CharacterMove };
  export const Settings = deepFreeze(SettingsData);

  export const offscreen = (
    typeof HTMLCanvasElement !== 'undefined' && !!(
      HTMLCanvasElement.prototype as OffscreenCanvas
    ).transferControlToOffscreen
  );

  export const worker = (
    typeof WorkerGlobalScope !== 'undefined' &&
    self instanceof WorkerGlobalScope
  );

  /* eslint-disable no-undef */
  export const DEBUG = !PRODUCTION;
  export const VERSION = BUILD;
  /* eslint-enable no-undef */

  export const colliders = false;
  export const hitBoxes = false;

  export const Level = deepFreeze({
    position: new Vector3(...LevelData.position),
    sidewalkHeight: LevelData.sidewalkHeight,
    portalsOffset: LevelData.portalsOffset,
    scale: new Vector3(...LevelData.scale),

    fogDensity: LevelData.fogDensity,
    lighting: LevelData.lighting,
    sidewalk: LevelData.sidewalk,
    ambient:  LevelData.ambient,
    portals: LevelData.portals,

    skybox: LevelData.skybox,
    bounds: LevelData.bounds,
    height: LevelData.height,
    depth: LevelData.depth,

    model: LevelData.model,
    cloud: LevelData.cloud,
    music: LevelData.music,
    rain: LevelData.rain,
    fog: LevelData.fog
  });

  export const Camera = deepFreeze({
    fps: {
      idle: new Vector3(...CameraData.fps.idle),
      run: new Vector3(...CameraData.fps.idle),
      aim: new Vector3(...CameraData.fps.aim)
    },

    tps: {
      idle: new Vector3(...CameraData.tps.idle),
      run: new Vector3(...CameraData.tps.run),
      aim: new Vector3(...CameraData.tps.aim)
    }
  });

  export const Player = deepFreeze({
    position: new Vector3(...PlayerData.position),
    collider: new Vector3(...PlayerData.collider),
    scale: new Vector3(...PlayerData.scale),

    moves: parseCharacterMoves(playerMoves),
    animations: PlayerData.animations,

    sounds: PlayerData.sounds,
    model: PlayerData.model
  });

  export const Enemy = deepFreeze({
    position: new Vector3(...EnemyData.position),
    collider: new Vector3(...EnemyData.collider),
    scale: new Vector3(...EnemyData.scale),

    moves: parseCharacterMoves(enemyMoves),
    animations: EnemyData.animations,

    sounds: EnemyData.sounds,
    model: EnemyData.model
  });

  export const Pistol = deepFreeze({
    bullet: {
      position: new Vector3(...PistolData.bullet.position),
      lifeTime: PistolData.bullet.lifeTime,
      speed: PistolData.bullet.speed,
      scale: PistolData.bullet.scale
    },

    position: new Vector3(...PistolData.position),
    rotation: new Euler(...PistolData.rotation),

    spread: new Vector2(...PistolData.spread),
    recoil: new Vector2(...PistolData.recoil),
    scale: new Vector3(...PistolData.scale),
    magazine: getAmmo(PistolData.magazine),

    fire: {
      position: new Vector2(...PistolData.fire.position),
      particles: PistolData.fire.particles,
      velocity: PistolData.fire.velocity,
      scale: PistolData.fire.scale
    },

    ammo: getAmmo(PistolData.ammo),
    textures: PistolData.textures,

    sounds: PistolData.sounds,
    damage: PistolData.damage,
    model: PistolData.model
  });

  export const Rifle = deepFreeze({
    bullet: {
      position: new Vector3(...RifleData.bullet.position),
      lifeTime: RifleData.bullet.lifeTime,
      speed: RifleData.bullet.speed,
      scale: RifleData.bullet.scale
    },

    worldScale: new Vector3(...RifleData.worldScale),
    position: new Vector3(...RifleData.position),
    rotation: new Euler(...RifleData.rotation),

    spread: new Vector2(...RifleData.spread),
    recoil: new Vector2(...RifleData.recoil),
    scale: new Vector3(...RifleData.scale),
    magazine: getAmmo(RifleData.magazine),

    fire: {
      position: new Vector2(...RifleData.fire.position),
      particles: RifleData.fire.particles,
      velocity: RifleData.fire.velocity,
      scale: RifleData.fire.scale
    },

    ammo: getAmmo(RifleData.ammo),
    textures: RifleData.textures,
    maxStock: RifleData.maxStock,

    sounds: RifleData.sounds,
    damage: RifleData.damage,
    model: RifleData.model
  });
}

export default Configs;
