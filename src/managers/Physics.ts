import { BoxGeometry } from '@three/geometries/BoxGeometry';
import { ColliderMaterial } from '@/utils/Material';
import { GameEvents } from '@/managers/GameEvents';
import { Mesh } from '@three/objects/Mesh';
import APE from 'APE/build/APE.Rigid.min';

export default class Physics {
  constructor () {
    APE.init();
  }

  public addLevel (): void {
    const ground = new Mesh(
      new BoxGeometry(100, 0.01, 100),
      ColliderMaterial
    );

    APE.Static.addBox(ground);
    GameEvents.dispatch('add:object', ground);
  }

  public update (): void {
    APE.update();
  }
}
