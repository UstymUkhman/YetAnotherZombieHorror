import type { AmmoWorld, AmmoBody, RigidBody, Collider } from './physics.d';
type Quaternion = import('three/src/math/Quaternion').Quaternion;
type Vector3 = import('three/src/math/Vector3').Vector3;

import { GameEvents } from '@/managers/GameEvents';
import { Mesh } from 'three/src/objects/Mesh';
import PhysicsWorld from './PhysicsWorld';
import Ammo from 'ammo.js';

const DISABLE = 5;
const ENABLE = 1;

export default class AmmoPhysics extends PhysicsWorld
{
  private readonly colliders: Map<string, Collider> = new Map();
  private readonly linearVelocity = new Ammo.btVector3();
  private readonly transform = new Ammo.btTransform();

  private player!: Collider;
  private world: AmmoWorld;
  private paused = false;

  public constructor () {
    super();

    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();

    this.world = new Ammo.btDiscreteDynamicsWorld(
      new Ammo.btCollisionDispatcher(collisionConfiguration),
      new Ammo.btDbvtBroadphase(),
      new Ammo.btSequentialImpulseConstraintSolver(),
      collisionConfiguration
    );

    this.world.setGravity(new Ammo.btVector3(0.0, this.GRAVITY, 0.0));
  }

  private createRigidBody (shape: RigidBody, mass: number, position: Vector3, quaternion: Quaternion): AmmoBody {
    const transform = new Ammo.btTransform();

    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

    const inertia = new Ammo.btVector3(0.0, 0.0, 0.0);
    const motion = new Ammo.btDefaultMotionState(transform);
    if (mass > 0.0) shape.calculateLocalInertia(mass, inertia);

    const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(mass, motion, shape, inertia));

    body.setDamping(0.0, 0.0);
    body.setRestitution(0.0);
    body.setFriction(0.0);

    return body;
  }

  private createCharacterCollider (mesh: Mesh, mass: number): void {
    const { radius, height } = mesh.userData;
    const shape = new Ammo.btCapsuleShape(radius * 0.9225, height * 0.9225);
    const body = this.createRigidBody(shape, mass, mesh.position, mesh.quaternion);

    body.setAngularFactor(new Ammo.btVector3(0.0, 0.0, 0.0));
    body.setLinearFactor(new Ammo.btVector3(1.0, 1.0, 1.0));

    this.colliders.set(mesh.uuid, { mesh, body });
    this.world.addRigidBody(body, 128, 0xFFFF);
    GameEvents.dispatch('add:object', mesh);
  }

  protected addStaticCollider (collider: Mesh): void {
    const { x, y, z } = this.sizeVector;

    this.world.addRigidBody(this.createRigidBody(
      new Ammo.btBoxShape(new Ammo.btVector3(x / 2.0, y / 2.0, z / 2.0)),
      0.0, collider.position, collider.quaternion
    ), 2.0, 0xFFFF);
  }

  public setPlayer (player: Mesh): void {
    this.createCharacterCollider(player, 90);
    this.player = this.colliders.get(player.uuid) as Collider;
    this.player.body.forceActivationState(DISABLE);
  }

  public move (direction: Vector3): void {
    this.linearVelocity.setValue(direction.x, direction.y, direction.z);
    this.player.body.setLinearVelocity(this.linearVelocity);
    this.player.body.forceActivationState(ENABLE);
  }

  public stop (): void {
    this.linearVelocity.setValue(0.0, 0.0, 0.0);
    this.player.body.forceActivationState(DISABLE);
    this.player.body.setLinearVelocity(this.linearVelocity);
  }

  public update (delta: number): void {
    if (this.paused) return;
    this.world.stepSimulation(delta);

    this.colliders.forEach(collider => {
      const { mesh, body } = collider;
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
    this.colliders.clear();
    this.paused = true;
  }

  public set pause (pause: boolean) {
    this.player.body.forceActivationState(pause ? DISABLE : ENABLE);
    this.paused = pause;
  }
}
