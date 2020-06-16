export interface Application {
  DEBUG: boolean
  APP: boolean
}

const userAgent = navigator.userAgent.toLowerCase();
const isApp = userAgent.includes('electron');

export const Game = Object.freeze({
  DEBUG: true,
  APP: isApp
});
