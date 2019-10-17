import PLAYER from '@/assets/gltf/player.glb';
import { LoopOnce } from '@three/constants';
import Character from '@/Character';
import anime from 'animejs';

export default class Player extends Character {
  constructor (onLoad) {
    super(PLAYER, player => {
      this.currentAnimation = this.animations.rifleIdle;

      this.animations.rifleAim.clampWhenFinished = true;
      this.animations.death.clampWhenFinished = true;

      this.animations.rifleAim.setLoop(LoopOnce);
      this.animations.death.setLoop(LoopOnce);

      player.rotation.set(0, this.rotation, 0);
      player.scale.set(1.8, 1.8, 1.8);
      player.position.set(0, 0.5, 0);

      this.currentAnimation.play();
      onLoad(player);
    });

    this.rotation = -Math.PI / 1.25;
  }

  idle () {
    this.currentAnimation.crossFadeTo(this.animations.rifleIdle, 0.25, true);
    this.animations.rifleIdle.play();

    setTimeout(() => {
      this.currentAnimation.stop();
      this.currentAnimation = this.animations.rifleIdle;
    }, 250);

    anime({
      targets: this.character.rotation,
      y: this.rotation,
      easing: 'linear',
      duration: 250
    });
  }

  aim () {
    this.currentAnimation.crossFadeTo(this.animations.rifleAim, 0.25, true);
    this.animations.rifleAim.play();

    setTimeout(() => {
      this.currentAnimation.stop();
      this.currentAnimation = this.animations.rifleAim;
    }, 250);

    anime({
      targets: this.character.rotation,
      y: -Math.PI / 1.0,
      easing: 'linear',
      duration: 250
    });
  }

  update (delta) {
    super.update(delta);
  }
};
