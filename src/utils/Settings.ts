import { deepFreeze } from '@/utils/deepFreeze';
import Player from '@/settings/player.json';
import Enemy from '@/settings/enemy.json';

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
