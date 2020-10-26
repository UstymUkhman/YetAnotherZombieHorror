import Level0Data from '@/settings/level0.json';
import PistolData from '@/settings/pistol.json';
import RifleData from '@/settings/rifle.json';

import PlayerData from '@/settings/player.json';
import EnemyData from '@/settings/enemy.json';

import { Vector2 } from '@three/math/Vector2';
import { Vector3 } from '@three/math/Vector3';

import deepFreeze from '@/utils/deepFreeze';
import { Euler } from '@three/math/Euler';

export namespace Settings {
  const parseCharacterMoves = (animations: CharacterMoves): Moves =>
    Object.assign({}, ...Object.keys(animations).map(animation => ({
      [animation]: {
        speed: animations[animation][0],

        direction: {
          x0: animations[animation][1],
          z0: animations[animation][2],
          x1: animations[animation][3],
          z1: animations[animation][4]
        }
      }
    })
  ));

  export const APP = navigator.userAgent.toLowerCase().includes('electron');
  const playerMoves = PlayerData.animations as unknown as CharacterMoves;
  const enemyMoves = EnemyData.animations as unknown as CharacterMoves;
  type Direction = { x0: number, x1: number, z0: number, z1: number };

  const getAmmo = (value: number) => value < 0 ? Infinity : value;
  export type Animations<Value> = { [key in Animation]: Value };
  type CharacterMoves = Record<string, Readonly<Array<number>>>;

  export type PlayerAnimations = keyof typeof Player.animations;
  export type EnemyAnimations = keyof typeof Enemy.animations;
  export type Animation = PlayerAnimations | EnemyAnimations;

  export type Move = { speed: number, direction: Direction };
  export type Character = typeof Player | typeof Enemy;
  export type Weapon = typeof Pistol | typeof Rifle;

  export type Coords = Readonly<[number, number]>;
  export type Bounds = Readonly<Array<Coords>>;

  export type Sounds = { [key in Sound]: string };
  export type Sound = PlayerSounds | EnemySounds;

  type PlayerSounds = keyof typeof Player.sounds;
  type EnemySounds = keyof typeof Enemy.sounds;
  type Moves = { [key: string]: Move };

  /* eslint-disable no-undef */
  export const VERSION: string = BUILD;
  export const DEBUG = !PRODUCTION;
  /* eslint-enable no-undef */

  export const freeCamera = false;
  export const colliders = false;
  export const hitBoxes = false;

  export const Level0 = deepFreeze({
    position: new Vector3(...Level0Data.position),
    sidewalkHeight: Level0Data.sidewalkHeight,
    scale: new Vector3(...Level0Data.scale),

    sidewalk: Level0Data.sidewalk,
    bounds: Level0Data.bounds,

    skybox: Level0Data.skybox,
    model: Level0Data.model,
    music: Level0Data.music,

    height: Level0Data.height,
    depth: Level0Data.depth
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

    sounds: RifleData.sounds,
    damage: RifleData.damage,
    speed: RifleData.speed,
    model: RifleData.model
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
}
