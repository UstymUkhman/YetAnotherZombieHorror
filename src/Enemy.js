import ZOMBIE from '@/assets/gltf/zombie.glb';
import { LoopOnce } from '@three/constants';
import Character from '@/Character';

export default class Enemy extends Character {
  constructor (onLoad) {
    super(ZOMBIE, enemy => {
      this.currentAnimation = this.animations.idle;

      this.animations.headshot.clampWhenFinished = true;
      this.animations.death.clampWhenFinished = true;

      this.animations.headshot.setLoop(LoopOnce);
      this.animations.death.setLoop(LoopOnce);

      enemy.rotation.set(0, this.rotation, 0);
      enemy.scale.set(1.8, 1.8, 1.8);
      enemy.position.set(0, 0.5, 0);

      this.animations.idle.play();
      onLoad(enemy);
    });

    this.rotation = -Math.PI;
  }

  update (delta) {
    super.update(delta);
  }
};
