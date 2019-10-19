import { MeshPhongMaterial } from '@three/materials/MeshPhongMaterial';
import { AnimationMixer } from '@three/animation/AnimationMixer';
import { gltfLoader } from '@/utils/assetsLoader';

import { camelCase } from '@/utils/string';
import to from 'await-to-js';

export default class Character {
  constructor (asset, onLoad = null) {
    this.load(asset, onLoad);

    this.character = null;
    this.animations = {};

    this._mixer = null;
    this._health = 100;
  }

  load (asset, callback) {
    return new Promise(async () => {
      let [error, gltf] = await to(gltfLoader(asset));

      if (!error) {
        gltf.scene.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;

            child.material = new MeshPhongMaterial({
              map: child.material.map,
              specular: 0x000000,
              skinning: true,
              shininess: 0
            });
          }
        });

        this._mixer = new AnimationMixer(gltf.scene);
        this._createAnimations(gltf.animations);

        this.character = gltf.scene;
        callback(this.character);
      }
    });
  }

  _createAnimations (clips) {
    for (let c = 0; c < clips.length; c++) {
      const clip = camelCase(clips[c].name);
      this.animations[clip] = this._mixer.clipAction(clips[c]);
    }
  }

  updatePosition (w, a, s, d) {
    // this.character.position
  }

  update (delta) {
    this._mixer.update(delta);
  }
};
