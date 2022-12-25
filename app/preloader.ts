import { contextBridge, ipcRenderer } from 'electron';
const { npm_package_version, npm_package_dependencies_three } = process.env;

window.addEventListener('DOMContentLoaded', () => {
  console.info(`App      : v${npm_package_version}`);
  console.info(`Node     : v${process.versions.node}`);
  console.info(`Chrome   : v${process.versions.chrome}`);
  console.info(`Electron : v${process.versions.electron}`);
  console.info(`three.js : r${npm_package_dependencies_three?.slice(1)}`);
});

contextBridge.exposeInMainWorld('exit', () => ipcRenderer.sendSync('exit'));
