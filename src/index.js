import { gltfLoader } from '@/utils/assetsLoader';
import Stage from '@/Stage';

import PLAYER from '@/assets/gltf/swat.glb';
import to from 'await-to-js';

(() => {
  const stage = new Stage();

  return new Promise(async () => {
    let [error, player] = await to(gltfLoader(PLAYER));

    if (!error) {
      player.scene.rotation.set(0, -Math.PI / 1.25, 0);
      player.scene.position.set(0, 0.5, 0);
      player.scene.scale.set(10, 10, 10);

      stage.scene.add(player.scene);
      stage.createGround();
    }
  });
})();

