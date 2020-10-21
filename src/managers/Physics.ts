/* eslint-disable @typescript-eslint/no-explicit-any */

type MeshBasicMaterial = import('@three/materials/MeshBasicMaterial').MeshBasicMaterial;
type SphereGeometry = import('@three/geometries/SphereGeometry').SphereGeometry;
// type CapsuleGeometry = import('@/utils/CapsuleGeometry').CapsuleGeometry;
type Quaternion = import('@three/math/Quaternion').Quaternion;

type Bounds = import('@/settings').Settings.Bounds;
type Bound = import('@/settings').Settings.Bound;

import { StaticCollider, Transparent } from '@/utils/Material';
import { BoxGeometry } from '@three/geometries/BoxGeometry';
import { getWorldDirection } from '@/managers/GameCamera';
import { GameEvents } from '@/managers/GameEvents';
import { Vector3 } from '@three/math/Vector3';

import { Mesh } from '@three/objects/Mesh';
import { Euler } from '@three/math/Euler';
import { PI } from '@/utils/Number';
import Ammo from 'ammo.js';

const ZERO_MASS = 0.0;
const MIN_SIZE = 0.01;
const GRAVITY = -9.81;

namespace Bullet {
  export type vector3 = Vector3;

  export type World = {
    addRigidBody: (body: any, group?: number, mask?: number) => void
    stepSimulation: (timeStep: number, maxSubSteps?: number) => void

    setGravity: (gravity: Vector3) => void
    __destroy__: () => void
  }
}

type BoundsOptions = {
  borders: Bounds
  height: number
  y: number
};

type Direction = {
  x: number
  z: number
};

class Physics {
  private readonly boxes: Map<string, {mesh: Mesh, body: any}> = new Map();

  private readonly angularVelocity = new Ammo.btVector3();
  private readonly linearVelocity = new Ammo.btVector3();
  private readonly transform = new Ammo.btTransform();

  private readonly positionVector = new Vector3();
  private readonly rotationVector = new Euler();
  private readonly sizeVector = new Vector3();

  private world: Bullet.World;
  private paused = false;
  private player: any;

  public constructor () {
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();

    this.world = new Ammo.btDiscreteDynamicsWorld(
      new Ammo.btCollisionDispatcher(collisionConfiguration),
      new Ammo.btDbvtBroadphase(),
      new Ammo.btSequentialImpulseConstraintSolver(),
      collisionConfiguration
    );

    this.world.setGravity(new Ammo.btVector3(0.0, GRAVITY, 0.0));
  }

  private createRigidBody (shape: any, mass: number, position: Vector3, quaternion: Quaternion): any {
    const transform = new Ammo.btTransform();

    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

    const inertia = new Ammo.btVector3(0.0, 0.0, 0.0);
    const motion = new Ammo.btDefaultMotionState(transform);
    if (mass > ZERO_MASS) shape.calculateLocalInertia(mass, inertia);

    const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(mass, motion, shape, inertia));

    body.setDamping(0.0, 0.0);
    body.setRestitution(0.0);
    body.setFriction(0.0);

    return body;
  }

  private createStaticBox (material: MeshBasicMaterial): void {
    const { x, y, z } = this.sizeVector;
    const box = new Mesh(new BoxGeometry(x, y, z), material);

    box.position.copy(this.positionVector);
    box.rotation.copy(this.rotationVector);

    const shape = new Ammo.btBoxShape(new Ammo.btVector3(x / 2.0, y / 2.0, z / 2.0));
    const body = this.createRigidBody(shape, ZERO_MASS, box.position, box.quaternion);

    this.world.addRigidBody(body, 2, 0xFFFF);
    GameEvents.dispatch('add:object', box);
  }

  /* private createDynamicBox (mesh: Mesh, mass: number): void {
    const { width, height, depth } = (mesh.geometry as BoxGeometry).parameters;
    const shape = new Ammo.btBoxShape(new Ammo.btVector3(width / 2.0, height / 2.0, depth / 2.0));
    const body = this.createRigidBody(shape, mass, mesh.position, mesh.quaternion);

    body.setAngularFactor(new Ammo.btVector3(0.0, 1.0, 0.0));
    body.setLinearFactor(new Ammo.btVector3(1.0, 0.0, 1.0));

    this.world.addRigidBody(body, 128, 0xFFFF);
    this.boxes.set(mesh.uuid, { mesh, body });
    GameEvents.dispatch('add:object', mesh);
  } */

  private createDynamicSphere (mesh: Mesh, mass: number): void {
    const shape = new Ammo.btSphereShape((mesh.geometry as SphereGeometry).parameters.radius);
    const body = this.createRigidBody(shape, mass, mesh.position, mesh.quaternion);

    body.setAngularFactor(new Ammo.btVector3(0.0, 1.0, 0.0));
    body.setLinearFactor(new Ammo.btVector3(1.0, 0.0, 1.0));

    this.world.addRigidBody(body, 128, 0xFFFF);
    this.boxes.set(mesh.uuid, { mesh, body });
    GameEvents.dispatch('add:object', mesh);
  }

  /* private createDynamicCapsule (mesh: Mesh, mass: number): void {
    const { radius, height } = mesh.geometry as CapsuleGeometry;

    const shape = new Ammo.btCapsuleShape(radius, height / 2.0);
    const body = this.createRigidBody(shape, mass, mesh.position, mesh.quaternion);

    body.setAngularFactor(new Ammo.btVector3(0.0, 1.0, 0.0));
    body.setLinearFactor(new Ammo.btVector3(1.0, 0.0, 1.0));

    this.world.addRigidBody(body, 128, 0xFFFF);
    this.boxes.set(mesh.uuid, { mesh, body });
    GameEvents.dispatch('add:object', mesh);
  } */

  public createGround (min: Array<number>, max: Array<number>): void {
    this.sizeVector.set(Math.abs(min[0] - max[0]), MIN_SIZE, Math.abs(min[1] - max[1]));
    this.positionVector.set((min[0] + max[0]) / 2, 0, (min[1] + max[1]) / 2);
    this.createStaticBox(Transparent);
  }

  private borderOverflow (border: Vector3) {
    const { x, z } = this.positionVector;
    return Math.abs(x) > Math.abs(border.x) && Math.abs(z) > Math.abs(border.z);
  }

  private createBound (current: Bound, next: Bound, h: number, y = 0): void {
    this.rotationVector.set(0, 0, 0);

    const x0 = current[0];
    const z0 = current[1];

    const x1 = x0 - next[0];
    const z1 = z0 - next[1];

    const x = x1 / -2 + x0;
    const z = z1 / -2 + z0;

    let w = Math.abs(x1);
    let d = Math.abs(z1);

    if (w && d) {
      const deeper = d > w;
      const length = Math.sqrt(w ** 2 + d ** 2);

      this.rotationVector.set(0, deeper
        ? PI.d2 + Math.atan(d / w)
        : PI.d2 - Math.atan(w / d)
      , 0);

      deeper ? d = length : w = length;
    }

    w = w < d ? MIN_SIZE : w;
    d = d < w ? MIN_SIZE : d;

    this.positionVector.set(x, y, z);
    this.sizeVector.set(w, h, d);
  }

  public createBounds (bounds: BoundsOptions, sidewalk: BoundsOptions): void {
    const borderPosition = new Vector3();

    const border = bounds.borders.concat([bounds.borders[0]]);
    const walk = sidewalk.borders.concat([sidewalk.borders[0]]);

    for (let b = 0; b < bounds.borders.length; b++) {
      this.createBound(border[b], border[b + 1], bounds.height, bounds.y);
      this.createStaticBox(StaticCollider);

      borderPosition.copy(this.positionVector);
      this.createBound(walk[b], walk[b + 1], sidewalk.height, sidewalk.y);

      if (this.borderOverflow(borderPosition)) continue;

      // const { y } = this.rotationVector;
      const horizontal = this.sizeVector.z === MIN_SIZE;
      const distance = this.positionVector.distanceTo(borderPosition) / 2 * 0.95;

      // if (horizontal) this.rotationVector.x = Math.PI / 6;
      // else this.rotationVector.z = Math.PI / 6;

      this.createStaticBox(StaticCollider);
      // this.rotationVector.set(0, y, 0);

      this.positionVector.x -= (this.positionVector.x - borderPosition.x) / 2;
      this.positionVector.z -= (this.positionVector.z - borderPosition.z) / 2;

      horizontal ? this.sizeVector.setZ(distance) : this.sizeVector.setX(distance);
      this.createStaticBox(StaticCollider);
    }
  }

  public setPlayer (player: Mesh): void {
    this.createDynamicSphere(player, 90);
    this.player = this.boxes.get(player.uuid)?.body;
  }

  public move (/* direction: Direction */): void {
    const rotation = getWorldDirection();
    const theta = Math.atan2(rotation.x, rotation.z);

    const x = Math.sin(theta) * 5;
    const z = Math.cos(theta) * 5;

    this.linearVelocity.setValue(x, 0, z);
    this.player.setLinearVelocity(this.linearVelocity);
  }

  public rotate (rotation: number): void {
    if (!this.player) return;

    this.angularVelocity.setValue(0.0, rotation, 0.0);
    this.player.setAngularVelocity(this.angularVelocity);
  }

  public stop (): void {
    if (!this.player) return;

    this.linearVelocity.setValue(0.0, 0.0, 0.0);
    this.angularVelocity.setValue(0.0, 0.0, 0.0);

    this.player.setAngularVelocity(this.angularVelocity);
    this.player.setLinearVelocity(this.linearVelocity);
  }

  public update (delta: number): void {
    this.world.stepSimulation(delta);

    this.boxes.forEach(box => {
      const { mesh, body } = box;
      const motionState = body.getMotionState();

      if (motionState) {
        motionState.getWorldTransform(this.transform);

        const origin = this.transform.getOrigin();
        const rotation = this.transform.getRotation();

        mesh.position.set(origin.x(), origin.y(), origin.z());
        mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
      }
    });
  }

  public destroy (): void {
    this.world.__destroy__();
    this.boxes.clear();
  }

  public set pause (pause: boolean) {
    this.paused = pause;
  }

  public get pause (): boolean {
    return this.paused;
  }
}

export default new Physics();
/* eslint-enable @typescript-eslint/no-explicit-any */
