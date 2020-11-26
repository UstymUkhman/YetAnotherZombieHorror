type AmmoQuaternion = import('@three/math/Quaternion').Quaternion;
type AmmoVector3 = import('@three/math/Vector3').Vector3;
type Mesh = import('@three/objects/Mesh').Mesh;
import type { Bounds } from '@/types.d';

interface AmmoWorld {
  addRigidBody: (body: AmmoBody, group?: number, mask?: number) => void
  stepSimulation: (timeStep: number, maxSubSteps?: number) => void

  setGravity: (gravity: AmmoVector3) => void
  __destroy__: () => void
}

interface RigidBody {
  calculateLocalInertia: (mass: number, inertia: AmmoVector3) => void
}

interface AmmoBody {
  getMotionState: () => undefined | {
    getWorldTransform: (transform: AmmoTransform) => void
  }

  setAngularFactor: (angularFactor: AmmoVector3) => void
  setLinearFactor: (linearFactor: AmmoVector3) => void

  setLinearVelocity: (velocity: AmmoVector3) => void
  forceActivationState: (state: number) => void
}

interface AmmoTransform {
  setRotation: (origin: AmmoQuaternion) => void
  setOrigin: (origin: AmmoVector3) => void
  setIdentity: () => void
}

type BoundsOptions = {
  borders: Bounds
  height: number
  y: number
};

type Collider = {
  body: AmmoBody
  mesh: Mesh,
};
