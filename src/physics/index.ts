import type { Vector3 } from 'three/src/math/Vector3';
import type { BoundsOptions } from '@/physics/types';
import type { Mesh } from 'three/src/objects/Mesh';
import PhysicsWorld from '@/physics/PhysicsWorld';

import type { Coords } from '@/physics/types';
import Settings from '@/config/settings';

class Physics extends PhysicsWorld
{
  protected addStaticCollider (): void { return; }
  private calls: Map<string, Array<unknown>> = new Map();

  private physics: Promise<PhysicsWorld> | PhysicsWorld = import(
    Settings.ammoPhysics
      ? '@/physics/AmmoPhysics'
      : '@/physics/BVHPhysics'
  ).then(this.initializePhysics.bind(this));

  private initializePhysics (Physics: { default: new () => PhysicsWorld }) {
    this.physics = new Physics.default();

    for (const [fn, args] of this.calls) {
      this.callPhysicsMethod(fn, args);
    }

    this.calls.clear();
    return this.physics;
  }

  private handleMethodCall (method: string, args: Array<unknown>): void {
    this.physics instanceof Promise
      ? this.calls.set(method, args)
      : this.callPhysicsMethod(method, args);
  }

  private callPhysicsMethod (method: string, args: Array<unknown>): void {
    ((this.physics as PhysicsWorld)[method as keyof PhysicsWorld] as (args: unknown) => void)
      .apply(this.physics, args as [args: unknown]);
  }

  public override createBounds (bounds: BoundsOptions, sidewalk: BoundsOptions): void {
    this.handleMethodCall('createBounds', [bounds, sidewalk]);
  }

  public override createGround (min: Coords, max: Coords): void {
    this.handleMethodCall('createGround', [min, max]);
  }

  public override teleportCollider (uuid: string): void {
    const physics = this.physics as PhysicsWorld;
    physics.teleportCollider && physics.teleportCollider(uuid);
  }

  public setPlayer (player: Mesh): void {
    (this.physics as PhysicsWorld).setPlayer(player);
  }

  public move (direction: Vector3): void {
    (this.physics as PhysicsWorld).move(direction);
  }

  public update (delta: number): void {
    (this.physics as PhysicsWorld).update(delta);
  }

  public set pause (pause: boolean) {
    (this.physics as PhysicsWorld).pause = pause;
  }

  public dispose (): void {
    (this.physics as PhysicsWorld).dispose();
  }

  public stop (): void {
    (this.physics as PhysicsWorld).stop();
  }
}

export default new Physics();
