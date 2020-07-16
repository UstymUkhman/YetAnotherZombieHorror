type GLTFModel = import('@/managers/AssetsLoader').Assets.GLTFModel;
type GLTF = import('@/managers/AssetsLoader').Assets.GLTF;

import { SkeletonUtils } from '@utils/SkeletonUtils';
import Character from '@/characters/Character';
import { Settings } from '@/settings';

export default class Enemy extends Character {
  private id: number;

  public constructor (id = 0, model?: GLTFModel) {
    super(Settings.Enemy);
    this.id = id;

    if (model !== undefined) {
      const scene = SkeletonUtils.clone(model.scene) as GLTF;
      super.setCharacterMaterial(scene, 0);
      super.createAnimations(model);
    }
  }

  public update (delta: number): void {
    super.update(delta);

    /* if (super.alive && super.character) {
      super.character.lookAt(this.playerPosition);
    } */
  }
}
