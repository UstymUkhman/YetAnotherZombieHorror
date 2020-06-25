import { ipcRenderer } from 'electron';

window.addEventListener('DOMContentLoaded', () => {
  console.log(`Node     : ${process.versions.node}`);
  console.log(`Chrome   : ${process.versions.chrome}`);
  console.log(`Electron : ${process.versions.electron}`);

  const closeButton = document.getElementById('close-button');
  closeButton.addEventListener('click', () => ipcRenderer.send('close'), false);
});
