type BufferGeometry = import ('three/src/core/BufferGeometry').BufferGeometry;
type BVHGeometry = BufferGeometry & { boundsTree?: typeof MeshBVH };
type Quaternion = import('three/src/math/Quaternion').Quaternion;

type Triangle = import('three/src/math/Triangle').Triangle;
type Vector3 = import('three/src/math/Vector3').Vector3;
import type MeshBVH from 'three-mesh-bvh/src/MeshBVH';

type Line3 = import('three/src/math/Line3').Line3;
type Mesh = import('three/src/objects/Mesh').Mesh;

type LevelColliders = Map<number, Array<Mesh>>;
import type { /* Coords, */ Bounds } from '@/types.d';

interface SeparatingAxisTriangle extends Triangle {
  closestPointToSegment: (segment: Line3, target1?: Vector3, target2?: Vector3) => number
}

// interface PhysicsWorld {
//   createBounds: (bounds: BoundsOptions, sidewalk: BoundsOptions) => void
//   createGround: (min: Coords, max: Coords) => void

//   move: (direction: Vector3) => void
//   setPlayer: (player: Mesh) => void
//   update: (delta: number) => void

//   destroy: () => void
//   stop: () => void
//   pause: boolean
// }

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

type Collider = {
  body: AmmoBody
  mesh: Mesh
};
