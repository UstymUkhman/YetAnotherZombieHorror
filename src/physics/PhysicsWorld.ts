import type { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { StaticCollider, Transparent } from '@/utils/Material';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';

import type { BoundsOptions } from '@/physics/types';
import { GameEvents } from '@/events/GameEvents';
import { Vector3 } from 'three/src/math/Vector3';

import type { Coords } from '@/physics/types';
import { Mesh } from 'three/src/objects/Mesh';
import { Euler } from 'three/src/math/Euler';
import { PI } from '@/utils/Number';

const MIN_SIZE = 0.01;

export default abstract class PhysicsWorld
{
  protected abstract addStaticCollider (collider: Mesh): void;

  protected readonly positionVector = new Vector3();
  protected readonly rotationVector = new Euler();
  protected readonly sizeVector = new Vector3();

  public abstract move (direction: Vector3): void;
  public abstract setPlayer (player: Mesh): void;
  public teleportCollider? (uuid: string): void;
  public abstract update (delta: number): void;

  protected readonly GRAVITY = -9.81;

  public abstract dispose (): void;
  public abstract pause: boolean;
  public abstract stop (): void;

  private createBound (current: Coords, next: Coords, h: number, y = 0): void {
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

  private borderOverflow (border: Vector3) {
    const { x, z } = this.positionVector;

    return (
      Math.abs(x) > Math.abs(border.x) &&
      Math.abs(z) > Math.abs(border.z) &&
      x - border.x <= 1.0 &&
      z - border.z <= 1.0
    );
  }

  protected createStaticCollider (material: MeshBasicMaterial): void {
    const { x, y, z } = this.sizeVector;
    const collider = new Mesh(new BoxGeometry(x, y, z), material);

    collider.position.copy(this.positionVector);
    collider.rotation.copy(this.rotationVector);

    GameEvents.dispatch('Add:object', collider);
    this.addStaticCollider(collider);
  }

  public createGround (min: Coords, max: Coords): void {
    this.sizeVector.set(Math.abs(min[0] - max[0]), MIN_SIZE, Math.abs(min[1] - max[1]));
    this.positionVector.set((min[0] + max[0]) / 2, 0, (min[1] + max[1]) / 2);
    this.createStaticCollider(Transparent);
  }

  public createBounds (bounds: BoundsOptions, sidewalk: BoundsOptions): void {
    const borderPosition = new Vector3();

    const border = bounds.borders.concat([bounds.borders[0]]);
    const walk = sidewalk.borders.concat([sidewalk.borders[0]]);

    for (let b = 0; b < bounds.borders.length; b++) {
      this.createBound(border[b], border[b + 1], bounds.height, bounds.y);
      this.createStaticCollider(StaticCollider);

      borderPosition.copy(this.positionVector);
      this.createBound(walk[b], walk[b + 1], sidewalk.height, sidewalk.y);

      if (this.borderOverflow(borderPosition)) continue;
      const lengthScale = this.rotationVector.y ? 1.1 : 1;
      const distance = this.positionVector.distanceTo(borderPosition) / 2 * 0.95;

      this.positionVector.x -= (this.positionVector.x - borderPosition.x) / 2;
      this.positionVector.z -= (this.positionVector.z - borderPosition.z) / 2;

      this.sizeVector.z === MIN_SIZE ? this.sizeVector.setZ(distance) : this.sizeVector.setX(distance);
      this.positionVector.x < 0 ? this.sizeVector.z *= lengthScale : this.sizeVector.x *= lengthScale;

      this.createStaticCollider(StaticCollider);
    }
  }
}
