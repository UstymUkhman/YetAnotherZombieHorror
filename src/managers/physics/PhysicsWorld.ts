type MeshBasicMaterial = import('three/src/materials/MeshBasicMaterial').MeshBasicMaterial;
import type { BoundsOptions } from './physics.d';
import type { Coords } from '@/types.d';

import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { GameEvents } from '@/managers/GameEvents';
import { Vector3 } from 'three/src/math/Vector3';

import { Transparent } from '@/utils/Material';
import { Mesh } from 'three/src/objects/Mesh';
import { Euler } from 'three/src/math/Euler';

export default abstract class PhysicsWorld {
  public abstract createBounds (bounds: BoundsOptions, sidewalk: BoundsOptions): void;
  protected abstract addStaticCollider (collider: Mesh): void;

  protected readonly positionVector = new Vector3();
  protected readonly rotationVector = new Euler();
  protected readonly sizeVector = new Vector3();

  public abstract move (direction: Vector3): void;
  public abstract setPlayer (player: Mesh): void;
  public abstract update (delta: number): void;

  protected readonly MIN_SIZE = 0.01;

  public abstract destroy (): void;
  public abstract pause: boolean;
  public abstract stop (): void;

  protected createStaticCollider (material: MeshBasicMaterial): void {
    const { x, y, z } = this.sizeVector;
    const collider = new Mesh(new BoxGeometry(x, y, z), material);

    collider.position.copy(this.positionVector);
    collider.rotation.copy(this.rotationVector);

    GameEvents.dispatch('add:object', collider);
    this.addStaticCollider(collider);
  }

  public createGround (min: Coords, max: Coords): void {
    this.sizeVector.set(Math.abs(min[0] - max[0]), this.MIN_SIZE, Math.abs(min[1] - max[1]));
    this.positionVector.set((min[0] + max[0]) / 2, 0, (min[1] + max[1]) / 2);
    this.createStaticCollider(Transparent);
  }
}
