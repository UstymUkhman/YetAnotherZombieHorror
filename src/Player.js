import PLAYER from '@/assets/gltf/player.glb';
import Character from '@/Character';
import anime from 'animejs';

export default class Player extends Character {
  constructor (onLoad) {
    super(PLAYER, (player) => {
      player.rotation.set(0, this.rotation, 0);
      player.scale.set(1.8, 1.8, 1.8);
      player.position.set(0, 0.5, 0);

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

  update () {
    super.update();
  }
};
