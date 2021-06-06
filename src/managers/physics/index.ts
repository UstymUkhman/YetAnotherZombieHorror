type Vector3 = import('three/src/math/Vector3').Vector3;
import type { Mesh } from 'three/src/objects/Mesh';
import type { BoundsOptions } from './physics.d';

type PhysicsMethod = (args: unknown) => void;
type PhysicsMethodName = keyof PhysicsWorld;

import PhysicsWorld from './PhysicsWorld';
import type { Coords } from '@/types.d';
import { Config } from '@/config';

class PhysicsManager extends PhysicsWorld
{
  protected addStaticCollider (): void { return; }
  private calls: Map<string, unknown[]> = new Map();

  private physics: Promise<PhysicsWorld> | PhysicsWorld = import(
    Config.Settings.ammoPhysics ? './AmmoPhysics' : './BVHPhysics'
  ).then(this.initializePhysics.bind(this));

  private initializePhysics (Physics: { default: new () => PhysicsWorld }) {
    this.physics = new Physics.default();

    for (const [fn, args] of this.calls) {
      const method = fn as PhysicsMethodName;
      const world = this.physics as PhysicsWorld;
      const physicsMethod = world[method] as PhysicsMethod;

      physicsMethod.apply(this.physics, args as [args: unknown]);
    }

    this.calls.clear();
    return this.physics;
  }

  public createBounds (bounds: BoundsOptions, sidewalk: BoundsOptions): void {
    this.physics instanceof Promise
      ? this.calls.set('createBounds', [bounds, sidewalk])
      : this.physics.createBounds(bounds, sidewalk);
  }

  public createGround (min: Coords, max: Coords): void {
    this.physics instanceof Promise
      ? this.calls.set('createGround', [min, max])
      : this.physics.createGround(min, max);
  }

  public move (direction: Vector3): void {
    this.physics instanceof Promise
      ? this.calls.set('move', [direction])
      : this.physics.move(direction);
  }

  public setPlayer (player: Mesh): void {
    this.physics instanceof Promise
      ? this.calls.set('setPlayer', [player])
      : this.physics.setPlayer(player);
  }

  public update (delta: number): void {
    this.physics instanceof Promise
      ? this.calls.set('update', [delta])
      : this.physics.update(delta);
  }

  public set pause (pause: boolean) {
    this.physics instanceof Promise
      ? this.calls.set('pause', [pause])
      : this.physics.pause = pause;
  }

  public destroy (): void {
    this.physics instanceof Promise
      ? this.calls.set('destroy', [])
      : this.physics.destroy();
  }

  public stop (): void {
    this.physics instanceof Promise
      ? this.calls.set('stop', [])
      : this.physics.stop();
  }
}

export default new PhysicsManager();
