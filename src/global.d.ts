declare module '*.json' {
  const value:  unknown;
  export default value;
}

declare const BUILD: string;
declare const PRODUCTION: boolean;

declare module 'APE/build/APE.Rigid.min';
declare module 'three/examples/js/libs/stats.min';
