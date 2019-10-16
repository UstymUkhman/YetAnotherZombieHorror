import PLAYER from '@/assets/gltf/player.glb';
import Character from '@/Character';

export default class Player extends Character {
  constructor (onLoad) {
    super(PLAYER, (player) => {
      player.rotation.set(0, -Math.PI / 1.25, 0);
      player.scale.set(1.8, 1.8, 1.8);
      player.position.set(0, 0.5, 0);

      onLoad(player);
    });
  }

  update () {
    super.update();
  }
};
