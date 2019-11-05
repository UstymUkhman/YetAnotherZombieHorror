import { MeshPhongMaterial } from '@three/materials/MeshPhongMaterial';
import { gltfLoader } from '@/utils/assetsLoader';

import { camelCase } from '@/utils/string';
import { clamp } from '@/utils/number';
import to from 'await-to-js';

const BOUNDS = {
  front: Infinity,
  side: Infinity
};

export default class Character {
  constructor (asset, settings, onLoad) {
    if (asset) this.load(asset, onLoad);
    this.speed = { x: 0, z: 0 };

    this.settings = settings;
    this.character = null;
    this.animations = {};

    this.running = false;
    this.moving = false;
    this.alive = true;
    this.loop = null;

    this.mixer = null;
    this.health = 100;
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

        gltf.scene.position.set(...this.settings.position);
        gltf.scene.scale.set(...this.settings.scale);
        callback(gltf.scene, gltf.animations);
      }
    });
  }

  createAnimations (clips) {
    for (let c = 0; c < clips.length; c++) {
      const clip = camelCase(clips[c].name);
      this.animations[clip] = this.mixer.clipAction(clips[c]);
    }
  }

  setDirection (direction) {
    this.speed.x = this.settings.moves[direction][0];
    this.speed.z = this.settings.moves[direction][1];
  }

  update (delta) {
    this.mixer.update(delta);

    if (this.moving) {
      this.character.translateX(this.speed.x);
      this.character.translateZ(this.speed.z);

      this.character.position.z = clamp(
        this.character.position.z,
        -BOUNDS.front,
        BOUNDS.front
      );

      this.character.position.x = clamp(
        this.character.position.x,
        -BOUNDS.side,
        BOUNDS.side
      );
    }
  }

  dispose () {
    for (const animation in this.animations) {
      this.animations[animation].stopFading();
      this.animations[animation].stop();
    }

    clearTimeout(this.crawlTimeout);
    delete this.character;
  }

  static setBounds (stage) {
    BOUNDS.front = stage.front;
    BOUNDS.side = stage.side;
  }
};