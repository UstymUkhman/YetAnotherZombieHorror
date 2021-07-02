import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import type { CharacterMove } from '@/types.d';

import CameraData from '@/config/camera.json';
import LimboData from '@/config/limbo.json';

import PlayerData from '@/config/player.json';
import EnemyData from '@/config/enemy.json';

import PistolData from '@/config/pistol.json';
import RifleData from '@/config/rifle.json';

import { Euler } from 'three/src/math/Euler';
import deepFreeze from '@/utils/deepFreeze';

export namespace Config
{
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
  const getAmmo = (value: number) => value < 0 ? Infinity : value;
  type CharacterMoves = { [key: string]: CharacterMove };

  /* eslint-disable no-undef */
  export const VERSION: string = BUILD;
  export const DEBUG = !PRODUCTION;
  /* eslint-enable no-undef */

  export const freeCamera = false;
  export const colliders = false;
  export const hitBoxes = false;

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

  export const Limbo = deepFreeze({
    position: new Vector3(...LimboData.position),
    sidewalkHeight: LimboData.sidewalkHeight,
    scale: new Vector3(...LimboData.scale),

    lighting: LimboData.lighting,
    sidewalk: LimboData.sidewalk,
    ambient:  LimboData.ambient,
    portals: LimboData.portals,

    skybox: LimboData.skybox,
    bounds: LimboData.bounds,
    height: LimboData.height,
    depth: LimboData.depth,

    model: LimboData.model,
    cloud: LimboData.cloud,
    music: LimboData.music,
    rain: LimboData.rain
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
    position: new Vector3(...PistolData.position),
    rotation: new Euler(...PistolData.rotation),

    spread: new Vector2(...PistolData.spread),
    recoil: new Vector2(...PistolData.recoil),
    scale: new Vector3(...PistolData.scale),

    magazine: getAmmo(PistolData.magazine),
    ammo: getAmmo(PistolData.ammo),

    sounds: PistolData.sounds,
    damage: PistolData.damage,
    speed: PistolData.speed,
    model: PistolData.model
  });

  export const Rifle = deepFreeze({
    worldScale: new Vector3(...RifleData.worldScale),
    position: new Vector3(...RifleData.position),
    rotation: new Euler(...RifleData.rotation),

    spread: new Vector2(...RifleData.spread),
    recoil: new Vector2(...RifleData.recoil),
    scale: new Vector3(...RifleData.scale),

    magazine: getAmmo(RifleData.magazine),
    ammo: getAmmo(RifleData.ammo),
    maxStock: RifleData.maxStock,

    sounds: RifleData.sounds,
    damage: RifleData.damage,
    speed: RifleData.speed,
    model: RifleData.model
  });
}
