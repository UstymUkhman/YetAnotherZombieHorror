import deepFreeze from '@/utils/deepFreeze';
import Player from './player.json';
import Enemy from './enemy.json';

const userAgent = navigator.userAgent.toLowerCase();
const isApp = userAgent.includes('electron');

/* eslint-disable no-undef */
export default deepFreeze({
  DEBUG: !PRODUCTION,
  VERSION: VERSION,
  APP: isApp,
  Player,
  Enemy
});
/* eslint-enable no-undef */
