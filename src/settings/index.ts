import { Vector3 } from '@three/math/Vector3';
import deepFreeze from '@/utils/deepFreeze';

import Level0 from './level0.json';
import Player from './player.json';
import Enemy from './enemy.json';

const userAgent = navigator.userAgent.toLowerCase();
const isApp = userAgent.includes('electron');

interface Level {
  position: Vector3;
  scale: Vector3;
  model: string;
}

export const level0: Level = {
  position: new Vector3(...Level0.position),
  scale: new Vector3(...Level0.scale),
  model: Level0.model
};

/* eslint-disable no-undef */
export default deepFreeze({
  DEBUG: !PRODUCTION,
  VERSION: VERSION,
  APP: isApp,
  Player,
  Enemy
});
/* eslint-enable no-undef */
