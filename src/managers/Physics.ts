type BoundsSettings = import('@/settings').Settings.Bounds;

import { BoxGeometry } from '@three/geometries/BoxGeometry';
import { ColliderMaterial } from '@/utils/Material';
import { GameEvents } from '@/managers/GameEvents';
import { Vector3 } from '@three/math/Vector3';

import { Mesh } from '@three/objects/Mesh';
import { Euler } from '@three/math/Euler';
import APE from 'APE/build/APE.Rigid.min';
import { PI } from '@/utils/Number';

class Physics {
  private readonly positionVector = new Vector3();
  private readonly rotationVector = new Euler();
  private readonly sizeVector = new Vector3();

  constructor () {
    APE.init();
  }

  private addStaticBox (): void {
    const { x, y, z } = this.sizeVector;
    const box = new Mesh(new BoxGeometry(x, y, z), ColliderMaterial);

    box.position.copy(this.positionVector);
    box.rotation.copy(this.rotationVector);

    GameEvents.dispatch('add:object', box);
    APE.Static.addBox(box);
  }

  public addBounds (height: number, py: number, levelBounds: BoundsSettings): void {
    const bounds = levelBounds.concat([levelBounds[0]]);

    for (let b = 0; b < levelBounds.length; b++) {
      this.rotationVector.set(0, 0, 0);

      const x0 = bounds[b][0];
      const z0 = bounds[b][1];

      const x1 = x0 - bounds[b + 1][0];
      const z1 = z0 - bounds[b + 1][1];

      const px = x1 / -2 + x0;
      const pz = z1 / -2 + z0;

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

      w = w < d ? 0.01 : w;
      d = d < w ? 0.01 : d;

      this.positionVector.set(px, py, pz);
      this.sizeVector.set(w, height, d);
      this.addStaticBox();
    }
  }

  public addGround (min: Array<number>, max: Array<number>): void {
    this.sizeVector.set(Math.abs(min[0] - max[0]), 0.01, Math.abs(min[1] - max[1]));
    this.positionVector.set((min[0] + max[0]) / 2, 0, (min[1] + max[1]) / 2);
    this.addStaticBox();
  }

  public addCollider (collider: Mesh): void {
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
