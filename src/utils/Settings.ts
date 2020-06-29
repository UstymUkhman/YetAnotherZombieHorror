import Player from '@assets/settings/player.json';
import Enemy from '@assets/settings/enemy.json';
import deepFreeze from '@/utils/deepFreeze';

const userAgent = navigator.userAgent.toLowerCase();
const isApp = userAgent.includes('electron');

/* eslint-disable no-undef */
export const Settings = deepFreeze({
  DEBUG: !PRODUCTION,
  VERSION: VERSION,
  APP: isApp,
  Player,
  Enemy
});
/* eslint-enable no-undef */
