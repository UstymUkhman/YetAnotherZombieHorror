import Level0Data from '@/settings/level0.json';
import PistolData from '@/settings/pistol.json';

import PlayerData from '@/settings/player.json';
import EnemyData from '@/settings/enemy.json';

import { Vector2 } from '@three/math/Vector2';
import { Vector3 } from '@three/math/Vector3';
import deepFreeze from '@/utils/deepFreeze';

export namespace Settings {
  export type Animations = { [key in Animation]: Array<number> };
  export type PlayerAnimations = keyof typeof Player.animations;
  export type EnemyAnimations = keyof typeof Enemy.animations;

  export type Animation = PlayerAnimations | EnemyAnimations;
  export type Character = typeof Player | typeof Enemy;
  export type Weapon = typeof Pistol /* | typeof Rifle */;

  export type Sounds = { [key in Sound]: string };
  export type Sound = PlayerSounds | EnemySounds;
  export type Bounds = typeof Level0.bounds;

  type PlayerSounds = keyof typeof Player.sounds;
  type EnemySounds = keyof typeof Enemy.sounds;

  const userAgent = navigator.userAgent.toLowerCase();
  const isApp = userAgent.includes('electron');

  export const freeCamera = false;
  export const colliders = false;
  export const hitBoxes = false;

  /* eslint-disable no-undef */
  export const VERSION: string = BUILD;
  export const DEBUG = !PRODUCTION;
  export const APP = isApp;
  /* eslint-enable no-undef */

  export const Level0 = deepFreeze({
    position: new Vector3(...Level0Data.position),
    scale: new Vector3(...Level0Data.scale),

    bounds: Level0Data.bounds,
    skybox: Level0Data.skybox,
    model: Level0Data.model,
    music: Level0Data.music,

    height: Level0Data.height,
    depth: Level0Data.depth
  });

  export const Player = deepFreeze({
    position: new Vector3(...PlayerData.position),
    collider: new Vector3(...PlayerData.collider),

    offset: new Vector3(...PlayerData.offset),
    scale: new Vector3(...PlayerData.scale),

    animations:  PlayerData.animations,
    sounds: PlayerData.sounds,
    model: PlayerData.model
  });

  export const Enemy = deepFreeze({
    position: new Vector3(...EnemyData.position),
    collider: new Vector3(...EnemyData.collider),

    offset: new Vector3(...EnemyData.offset),
    scale: new Vector3(...EnemyData.scale),

    animations:  EnemyData.animations,
    sounds: EnemyData.sounds,
    model: EnemyData.model
  });

  export const Pistol = deepFreeze({
    magazine: PistolData.magazine < 0 ? Infinity : PistolData.magazine,
    ammo: PistolData.ammo < 0 ? Infinity : PistolData.ammo,

    position: new Vector3(...PistolData.position),
    rotation: new Vector3(...PistolData.rotation),

    spread: new Vector2(...PistolData.spread),
    recoil: new Vector2(...PistolData.recoil),
    scale: new Vector3(...PistolData.scale),

    sounds: PistolData.sounds,
    damage: PistolData.damage,
    speed: PistolData.speed,
    model: PistolData.model
  });
}
