import { version } from '../package.json';

window.addEventListener('DOMContentLoaded', () => {
  console.info(`App      : ${version}`);
  console.info(`Node     : ${process.versions.node}`);
  console.info(`Chrome   : ${process.versions.chrome}`);
  console.info(`Electron : ${process.versions.electron}`);
});
