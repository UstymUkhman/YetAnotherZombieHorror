import ZOMBIE from '@/assets/gltf/zombie.glb';
import { Vector3 } from '@three/math/Vector3';
import { LoopOnce } from '@three/constants';

import config from '@/assets/enemy.json';
import Character from '@/Character';

export default class Enemy extends Character {
  constructor (onLoad) {
    super(ZOMBIE, config, enemy => {
      this.currentAnimation = this.animations.idle;

      this.animations.headshot.clampWhenFinished = true;
      this.animations.death.clampWhenFinished = true;

      this.animations.headshot.setLoop(LoopOnce);
      this.animations.death.setLoop(LoopOnce);

      console.log(this.animations);

      this.animations.idle.play();
      this.character = enemy;
      onLoad(enemy);
    });

    this.playerPosition = new Vector3();
  }

  update (delta) {
    super.update(delta);
    this.character.lookAt(this.playerPosition);
  }
};
