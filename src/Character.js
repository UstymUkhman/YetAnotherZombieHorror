import { MeshPhongMaterial } from '@three/materials/MeshPhongMaterial';
import { AnimationMixer } from '@three/animation/AnimationMixer';
import { gltfLoader } from '@/utils/assetsLoader';

import { LoopOnce } from '@three/constants';
import { camelCase } from '@/utils/string';
import { Clock } from '@three/core/Clock';
import to from 'await-to-js';

export default class Character {
  constructor (asset, onLoad = null) {
    this._clock = new Clock();
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

        this.currentAnimation = this.animations.rifleIdle;
        this.animations.rifleIdle.play();
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

    this.animations.rifleAim.clampWhenFinished = true;
    this.animations.death.clampWhenFinished = true;

    this.animations.rifleAim.setLoop(LoopOnce);
    this.animations.death.setLoop(LoopOnce);
  }

  update () {
    const delta = this._clock.getDelta();
    this._mixer.update(delta);
  }
};
