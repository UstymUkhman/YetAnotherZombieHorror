/// <reference types="svelte" />
/// <reference types="vite/client" />

declare module 'three-mesh-bvh';
declare module 'ammo.js';

declare module '*.vert' {
  const value: string;
  export default value;
}

declare module '*.frag' {
	const value: string;
	export default value;
}

declare module '*.glsl' {
	const value: string;
	export default value;
}

declare const PRODUCTION: boolean;
declare const STAGING: boolean;
declare const DEBUG: boolean;
declare const BUILD: string;
declare const TEST: boolean;
