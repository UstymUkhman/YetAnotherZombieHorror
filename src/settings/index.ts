import Level0Data from '@/settings/level0.json';
import PlayerData from '@/settings/player.json';
import EnemyData from '@/settings/enemy.json';

import { Vector3 } from '@three/math/Vector3';
import deepFreeze from '@/utils/deepFreeze';

/* eslint-disable no-undef */
export namespace Settings {
  export type Animations = { [key in Animation]: Array<number> }
  export type Animation = PlayerAnimations | EnemyAnimations;
  export type Character = typeof Player | typeof Enemy;
  export type Sounds = { [key in Sound]: string };
  export type Sound = PlayerSounds | EnemySounds;

  type PlayerAnimations = keyof typeof Player.animations;
  type EnemyAnimations = keyof typeof Enemy.animations;
  type PlayerSounds = keyof typeof Player.sounds;
  type EnemySounds = keyof typeof Enemy.sounds;

  const userAgent = navigator.userAgent.toLowerCase();
  const isApp = userAgent.includes('electron');

  export const VERSION: string = BUILD;
  export const DEBUG = !PRODUCTION;
  export const APP = isApp;

  export const Level0 = deepFreeze({
    position: new Vector3(...Level0Data.position),
    scale: new Vector3(...Level0Data.scale),
    skybox: Level0Data.skybox,
    model: Level0Data.model
  });

  export const Player = deepFreeze({
    position: new Vector3(...PlayerData.position),
    scale: new Vector3(...PlayerData.scale),
    animations:  PlayerData.animations,
    sounds: PlayerData.sounds,
    model: PlayerData.model
  });

  export const Enemy = deepFreeze({
    position: new Vector3(...EnemyData.position),
    scale: new Vector3(...EnemyData.scale),
    animations:  EnemyData.animations,
    sounds: EnemyData.sounds,
    model: EnemyData.model
  });
}
/* eslint-enable no-undef */
