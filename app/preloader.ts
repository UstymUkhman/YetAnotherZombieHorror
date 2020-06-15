import { Game } from '../src/utils/Environment';
import { ipcRenderer } from 'electron';

Game.APP = true;

window.addEventListener('DOMContentLoaded', () => {
  console.log(`Node     : ${process.versions.node}`);
  console.log(`Chrome   : ${process.versions.chrome}`);
  console.log(`Electron : ${process.versions.electron}`);

  const closeButton = document.getElementById('close-button');

  closeButton.addEventListener('click', (): void => {
    ipcRenderer.send('close');
  }, false);
});
