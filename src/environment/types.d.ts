import type { Shader } from 'three/src/renderers/shaders/ShaderLib';
import type { Vector3 } from 'three/src/math/Vector3';

type RainParticles = [Array<number>, Array<number>, Array<number>];
type ShaderCompileCallback = (shader: Shader) => void;

type RainParams = CoordsParams & {
  camera: Vector3,
  delta: number
};

type RainParticle = {
  position: Vector3,
  velocity: Vector3,

  rotation: number,
  maxLife: number,
  alpha: number,
  life: number
};
