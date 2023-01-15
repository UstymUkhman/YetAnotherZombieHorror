import type { AmmoWorld, AmmoBody, RigidBody, AmmoCollider } from '@/physics/types';
import type { Vector3 } from 'three/src/math/Vector3';
import type { Mesh } from 'three/src/objects/Mesh';

import PhysicsWorld from '@/physics/PhysicsWorld';
import { GameEvents } from '@/events/GameEvents';
import Ammo from 'ammo.js';

export default class AmmoPhysics extends PhysicsWorld
{
  private readonly colliders: Map<string, AmmoCollider> = new Map();
  private readonly linearVelocity = new Ammo.btVector3();
  private readonly transform = new Ammo.btTransform();

  private world: AmmoWorld;
  private paused = true;

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

  private createRigidBody (shape: RigidBody, mesh: Mesh, mass: number): AmmoBody {
    const transform = new Ammo.btTransform();
    const { position, quaternion } = mesh;

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
    const body = this.createRigidBody(shape, mesh, mass);

    body.setAngularFactor(new Ammo.btVector3(0.0, 0.0, 0.0));
    body.setLinearFactor(new Ammo.btVector3(1.0, 1.0, 1.0));

    this.colliders.set(mesh.uuid, { mesh, body });
    GameEvents.dispatch('Level::AddObject', mesh);
    this.world.addRigidBody(body, 128, 0xFFFF);
  }

  protected addStaticCollider (collider: Mesh): void {
    const { x, y, z } = this.sizeVector;

    this.world.addRigidBody(this.createRigidBody(
      new Ammo.btBoxShape(
        new Ammo.btVector3(x * 0.5, y * 0.5, z * 0.5)
      ), collider, 0.0
    ), 2.0, 0xFFFF);
  }

  public setCharacter (character: Mesh, mass: number): void {
    this.createCharacterCollider(character, mass);
    (this.colliders.get(character.uuid) as AmmoCollider).body.forceActivationState(this.DISABLE);
  }

  public override teleportCollider (uuid: string): void {
    const collider = this.colliders.get(uuid) as AmmoCollider;
    const { position, quaternion } = collider.mesh;

    this.transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    this.transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

    collider.body.setWorldTransform(this.transform);
  }

  public move (uuid: string, direction: Vector3): void {
    const collider = this.colliders.get(uuid) as AmmoCollider;
    this.linearVelocity.setValue(direction.x, direction.y, direction.z);

    collider.body.setLinearVelocity(this.linearVelocity);
    collider.body.forceActivationState(this.ENABLE);

    collider.body.setDamping(0.0, 0.0);
    collider.body.setFriction(0.0);
  }

  public stop (uuid: string): void {
    const collider = this.colliders.get(uuid);

    if (collider) {
      this.linearVelocity.setValue(0.0, 0.0, 0.0);
      collider.body.setLinearVelocity(this.linearVelocity);

      collider.body.setDamping(1.0, 1.0);
      collider.body.setFriction(1.0);
    }
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

  public remove (uuid: string): void {
    this.colliders.delete(uuid);
  }

  public dispose (): void {
    this.world.__destroy__();
    this.colliders.clear();
    this.paused = true;
  }

  public set pause (pause: boolean) {
    this.paused = pause;
    const state = pause ? this.DISABLE : this.ENABLE;
    this.colliders.forEach(collider => collider.body.forceActivationState(state));
  }
}
