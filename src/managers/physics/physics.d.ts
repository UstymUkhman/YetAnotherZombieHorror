type BVHGeometry = BufferGeometry & { boundsTree?: typeof MeshBVH };
import type { BufferGeometry } from 'three/src/core/BufferGeometry';
import type { Quaternion } from 'three/src/math/Quaternion';

import type { Triangle } from 'three/src/math/Triangle';
import type { Vector3 } from 'three/src/math/Vector3';
import type MeshBVH from 'three-mesh-bvh/src/MeshBVH';

import type { Mesh } from 'three/src/objects/Mesh';
import type { Line3 } from 'three/src/math/Line3';

type LevelColliders = Map<number, Array<Mesh>>;
import type { Bounds } from '@/types.d';

interface SeparatingAxisTriangle extends Triangle {
  closestPointToSegment: (segment: Line3, target1?: Vector3, target2?: Vector3) => number
}

interface AmmoWorld {
  addRigidBody: (body: AmmoBody, group?: number, mask?: number) => void
  stepSimulation: (timeStep: number, maxSubSteps?: number) => void

  setGravity: (gravity: Vector3) => void
  __destroy__: () => void
}

interface RigidBody {
  calculateLocalInertia: (mass: number, inertia: Vector3) => void
}

interface AmmoBody {
  getMotionState: () => undefined | {
    getWorldTransform: (transform: AmmoTransform) => void
  }

  setWorldTransform: (transform: AmmoTransform) => void
  setAngularFactor: (angularFactor: Vector3) => void
  setLinearFactor: (linearFactor: Vector3) => void

  setLinearVelocity: (velocity: Vector3) => void
  forceActivationState: (state: number) => void
}

interface AmmoTransform {
  setRotation: (origin: Quaternion) => void
  setOrigin: (origin: Vector3) => void
  setIdentity: () => void
}

type BoundsOptions = {
  borders: Bounds
  height: number
  y: number
};

type AmmoCollider = {
  body: AmmoBody
  mesh: Mesh
};
