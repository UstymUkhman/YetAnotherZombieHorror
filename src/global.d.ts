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

declare const BUILD: string;
declare const PRODUCTION: boolean;

declare module 'ammo.js';
declare module 'three-mesh-bvh/src/MeshBVH';
declare module 'three-mesh-bvh/src/MeshBVHVisualizer';
