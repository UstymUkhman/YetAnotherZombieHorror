type Animations = import('@/managers/AssetsLoader').Assets.Animations;
type GLTFModel = import('@/managers/AssetsLoader').Assets.GLTFModel;
type GLTF = import('@/managers/AssetsLoader').Assets.GLTF;
type LoadCallback = (character: GLTFModel) => void;

import { SkeletonUtils } from '@utils/SkeletonUtils';
import Character from '@/characters/Character';
import { Settings } from '@/settings';

export default class Enemy extends Character {
  public constructor (id: number, character?: GLTF, animations?: Animations) {
    super(Settings.Enemy);

    if (character !== undefined) {
      const scene = SkeletonUtils.clone(character) as GLTF;
      super.createAnimations({ scene, animations });
      super.setCharacterMaterial(scene, 0);
    }
  }

  public async load (): Promise<GLTFModel> {
    return await super.load();
  }

  public update (delta: number): void {
    super.update(delta);

    /* if (super.alive && super.character) {
      super.character.lookAt(this.playerPosition);
    } */
  }
}
