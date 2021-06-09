import { version, dependencies } from '../package.json';

window.addEventListener('DOMContentLoaded', () => {
  console.info(`App      : v${version}`);
  console.info(`Node     : v${process.versions.node}`);
  console.info(`Chrome   : v${process.versions.chrome}`);
  console.info(`three.js : r${dependencies.three.slice(1)}`);
  console.info(`Electron : v${process.versions.electron}`);
});
