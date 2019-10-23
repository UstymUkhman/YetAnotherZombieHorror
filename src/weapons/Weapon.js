import { MeshPhongMaterial } from '@three/materials/MeshPhongMaterial';
import { gltfLoader } from '@/utils/assetsLoader';
import { Raycaster } from '@three/core/Raycaster';

import { Vector2 } from '@three/math/Vector2';
import to from 'await-to-js';

export default class Character {
  constructor (asset, onLoad = null) {
    this.origin = new Vector2(0, 0);

    this.ray = new Raycaster();
    this.load(asset, onLoad);

    this.ray.near = 5;
    this.camera = null;
    this.targets = [];
    this.damage = 10;
    this.arm = null;
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
              specular: 0x2F2F2F
            });
          }
        });

        this.arm = gltf.scene;
        callback(gltf.scene);
      }
    });
  }

  shoot () {
    this.ray.setFromCamera(this.origin, this.camera);
    const colliders = this.ray.intersectObjects(this.targets);

    for (let c = 0; c < this.targets.length; c++) {
      this.targets[c].material.color.setHex(0xFF0000);
    }

    if (colliders.length) {
      colliders[0].object.material.color.setHex(0x00CC00);
    }
  }

  // update (delta) { }
};
