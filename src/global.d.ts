declare module 'ammo.js';

declare module '*.json' {
  const value:  unknown;
  export default value;
}

declare const BUILD: string;
declare const PRODUCTION: boolean;
declare module 'three/examples/js/libs/stats.min';
