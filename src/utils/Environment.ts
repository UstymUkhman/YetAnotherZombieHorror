export interface Application extends Window {
  DEBUG?: boolean
  APP?: boolean
}

const userAgent = navigator.userAgent.toLowerCase();
export const Game = window as Application;

Game.APP = userAgent.includes('electron');
Game.DEBUG = true;
