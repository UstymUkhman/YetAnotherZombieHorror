import { Vector3 } from '@three/math/Vector3';

import Level0Data from './level0.json';

import PlayerData from './player.json';
import EnemyData from './enemy.json';

interface Asset {
  readonly position: Vector3;
  readonly scale: Vector3;
  readonly model: string;
}

interface Character extends Asset {
  readonly animations: { [move: string]: Array<number> };
  readonly sounds: { [sound: string]: string };
}

/* eslint-disable no-undef */
export namespace Settings {
  const userAgent = navigator.userAgent.toLowerCase();
  const isApp = userAgent.includes('electron');

  export const VERSION: string = BUILD;
  export const DEBUG = !PRODUCTION;
  export const APP = isApp;

  export const Level0: Asset = Object.freeze({
    position: Object.freeze(new Vector3(...Level0Data.position)),
    scale: Object.freeze(new Vector3(...Level0Data.scale)),
    model: Level0Data.model
  });

  export const Player: Character = Object.freeze({
    position: Object.freeze(new Vector3(...PlayerData.position)),
    scale: Object.freeze(new Vector3(...PlayerData.scale)),
    animations:  Object.freeze(PlayerData.animations),
    sounds: PlayerData.sounds,
    model: PlayerData.model
  });

  export const Enemy: Character = Object.freeze({
    position: Object.freeze(new Vector3(...EnemyData.position)),
    scale: Object.freeze(new Vector3(...EnemyData.scale)),
    animations:  Object.freeze(EnemyData.animations),
    sounds: EnemyData.sounds,
    model: EnemyData.model
  });
}
/* eslint-enable no-undef */
