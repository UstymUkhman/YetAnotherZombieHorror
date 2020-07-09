type Animations = import('@/managers/AssetsLoader').Assets.Animations;
type GLTFModel = import('@/managers/AssetsLoader').Assets.GLTFModel;
type GLTF = import('@/managers/AssetsLoader').Assets.GLTF;
type LoadCallback = (character: GLTFModel) => void;

import { SkeletonUtils } from '@utils/SkeletonUtils';
import Character from '@/characters/Character';
import { Settings } from '@/settings';

export default class Enemy extends Character {
  public constructor (id: number, character?: GLTF, animations?: Animations, onLoad?: LoadCallback) {
    super(Settings.Enemy);

    if (character === undefined) {
      super.load().then(character => (onLoad as LoadCallback)(character));
    } else {
      const scene = SkeletonUtils.clone(character) as GLTF;
      super.createAnimations({ scene, animations });
      super.setCharacterMaterial(scene, 0);
    }
  }
}
