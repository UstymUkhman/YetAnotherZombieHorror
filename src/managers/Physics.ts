type MeshBasicMaterial = import('@three/materials/MeshBasicMaterial').MeshBasicMaterial;
type Bounds = import('@/settings').Settings.Bounds;
type Bound = import('@/settings').Settings.Bound;

import { ColliderMaterial, NoMaterial } from '@/utils/Material';
import { BoxGeometry } from '@three/geometries/BoxGeometry';
import { GameEvents } from '@/managers/GameEvents';
import { Vector3 } from '@three/math/Vector3';

import { Mesh } from '@three/objects/Mesh';
import { Euler } from '@three/math/Euler';
import APE from 'APE/build/APE.Rigid.min';
import { PI } from '@/utils/Number';

const MIN_SIZE = 0.01;

class Physics {
  private readonly positionVector = new Vector3();
  private readonly rotationVector = new Euler();
  private readonly sizeVector = new Vector3();

  constructor () {
    APE.init();
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

  private createStaticBox (material: MeshBasicMaterial): void {
    const { x, y, z } = this.sizeVector;
    const box = new Mesh(new BoxGeometry(x, y, z), material);

    box.position.copy(this.positionVector);
    box.rotation.copy(this.rotationVector);

    GameEvents.dispatch('add:object', box);
    APE.Static.addBox(box);
  }

  public createGround (min: Array<number>, max: Array<number>): void {
    this.sizeVector.set(Math.abs(min[0] - max[0]), MIN_SIZE, Math.abs(min[1] - max[1]));
    this.positionVector.set((min[0] + max[0]) / 2, 0, (min[1] + max[1]) / 2);
    this.createStaticBox(NoMaterial);
  }

  public createBounds (bounds: Bounds, height: number, y: number): void {
    const area = bounds.concat([bounds[0]]);

    for (let b = 0; b < bounds.length; b++) {
      this.createBound(area[b], area[b + 1], height, y);
      this.createStaticBox(ColliderMaterial);
    }
  }

  public createCollider (collider: Mesh): void {
    APE.Dynamic.addBox(collider, 100);
  }

  public update (): void {
    APE.Dynamic.update();
    APE.update();
  }

  public destroy (): void {
    APE.destroy();
  }
}

export default new Physics();
