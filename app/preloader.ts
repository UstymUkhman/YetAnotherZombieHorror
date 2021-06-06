import { ipcRenderer } from 'electron';

window.addEventListener('DOMContentLoaded', () => {
  console.info(`Node     : ${process.versions.node}`);
  console.info(`Chrome   : ${process.versions.chrome}`);
  console.info(`Electron : ${process.versions.electron}`);

  const closeButton = document.getElementById('close-button');
  closeButton?.addEventListener('click', () => ipcRenderer.send('close'), false);
});
