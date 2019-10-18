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

      console.log(this.animations);

      this.currentAnimation.play();
      onLoad(player);
    });

    this.rotation = -Math.PI / 1.25;

    this.hasRifle = true;
    this.running = false;
    this.aiming = false;
  }

  idle () {
    const idle = `${this.hasRifle ? 'rifle' : 'pistol'}Idle`;

    this.currentAnimation.crossFadeTo(this.animations[idle], 0.25, true);
    this.animations[idle].play();
    this.aiming = false;

    setTimeout(() => {
      this.currentAnimation.stop();
      this.currentAnimation = this.animations[idle];
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
    this.aiming = true;

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

  move (directions, run = false) {
    const direction = this.getMoveDirection(...directions);
    const animation = `${this.hasRifle ? 'rifle' : 'pistol'}${direction}`;

    this.currentAnimation.crossFadeTo(this.animations[animation], 0.25, true);
    this.animations[animation].play();

    setTimeout(() => {
      this.currentAnimation.stop();
      this.currentAnimation = this.animations[animation];
    }, 250);

    console.log(animation);
    this.running = run;
  }

  getMoveDirection (w, a, s, d) {
    let direction = w ? 'Forward' : s ? 'Backward' : '';
    direction += a ? 'Left' : d ? 'Right' : '';
    return direction || 'Idle';
  }

  update (delta) {
    super.update(delta);
  }
};
