import type { CanvasTexture } from 'three/src/textures/CanvasTexture';

export type CanvasTextureLoadCallback = (texture: CanvasTexture) => void;
export type CubeTextureLoadCallback = (texture: CubeTexture) => void;
export type ProgressCallback = (event: ProgressEvent) => void;
export type ErrorCallback = (event: ErrorEvent) => void;
