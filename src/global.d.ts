/// <reference types="svelte" />
/// <reference types="vite/client" />

declare module '*.vs' {
  const value: string;
  export default value;
}

declare module '*.fs' {
	const value: string;
	export default value;
}

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

declare module 'ammo.js';
declare module 'three-mesh-bvh';

declare const PRODUCTION: boolean;
declare const STAGING: boolean;
declare const DEBUG: boolean;
declare const BUILD: string;
