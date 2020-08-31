import { BoxGeometry } from '@three/geometries/BoxGeometry';
type BoundsSettings = import('@/settings').Settings.Bounds;
import { ColliderMaterial } from '@/utils/Material';
import { GameEvents } from '@/managers/GameEvents';

import { Vector3 } from '@three/math/Vector3';
import { Mesh } from '@three/objects/Mesh';
import { Euler } from '@three/math/Euler';
import APE from 'APE/build/APE.Rigid.min';
import { PI } from '@/utils/Number';

export default class Physics {
  private readonly positionVector = new Vector3();
  private readonly rotationVector = new Euler();
  private readonly sizeVector = new Vector3();

  constructor () {
    APE.init();
  }

  private addStaticBox (): void {
    const box = new Mesh(new BoxGeometry(
      this.sizeVector.x, this.sizeVector.y, this.sizeVector.z
    ), ColliderMaterial);

    box.position.copy(this.positionVector);
    box.rotation.copy(this.rotationVector);

    GameEvents.dispatch('add:object', box);
    APE.Static.addBox(box);
  }

  public addBounds (height: number, py = 0, levelBounds: BoundsSettings): void {
    const boundsLength = levelBounds.length;
    const bounds = levelBounds.concat([levelBounds[0]]);

    for (let b = 0; b < boundsLength; b++) {
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

  public addGround (bounds: BoundsSettings): void {
    let minX = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxZ = -Infinity;

    for (const b in bounds) {
      const x = bounds[b][0];
      const z = bounds[b][1];

      if (x < minX) minX = x;
      else if (x > maxX) maxX = x;

      if (z < minZ) minZ = z;
      else if (z > maxZ) maxZ = z;
    }

    this.sizeVector.set(Math.abs(minX - maxX), 0.01, Math.abs(minZ - maxZ));
    this.positionVector.set((minX + maxX) / 2, 0, (minZ + maxZ) / 2);
    this.addStaticBox();
  }

  public update (): void {
    APE.update();
  }
}
