import { MeshPhongMaterial } from '@three/materials/MeshPhongMaterial';
import { gltfLoader } from '@/utils/assetsLoader';
import to from 'await-to-js';

export default class Character {
  constructor (asset, onLoad = null) {
    this.load(asset, onLoad);
    this.weapon = null;
    this.damage = 10;
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

        this.weapon = gltf.scene;
        callback(gltf.scene);
      }
    });
  }

  // update (delta) { }
};
