import ZOMBIE from '@/assets/gltf/zombie.glb';
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

      enemy.rotation.set(0, -Math.PI, 0);
      this.animations.idle.play();

      this.character = enemy;
      onLoad(enemy);
    });
  }

  update (delta) {
    super.update(delta);
  }
};
