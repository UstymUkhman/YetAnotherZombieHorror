import { deepFreeze } from '@/utils/deepFreeze';
import Player from '@/settings/player.json';
import Enemy from '@/settings/enemy.json';

const userAgent = navigator.userAgent.toLowerCase();
const isApp = userAgent.includes('electron');

export const Settings = deepFreeze({
  DEBUG: true,
  APP: isApp,
  Player,
  Enemy
});
