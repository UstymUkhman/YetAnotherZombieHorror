import PLAYER from '@/assets/gltf/player.glb';
import { LoopOnce } from '@three/constants';
import config from '@/assets/player.json';
import Character from '@/Character';
// import anime from 'animejs';

export default class Player extends Character {
  constructor (onLoad) {
    super(PLAYER, config, player => {
      this.currentAnimation = this.animations.rifleIdle;

      this.animations.rifleAim.clampWhenFinished = true;
      this.animations.death.clampWhenFinished = true;

      this.animations.rifleAim.setLoop(LoopOnce);
      this.animations.death.setLoop(LoopOnce);

      player.position.set(...config.position);
      player.scale.set(...config.scale);

      // console.log(this.animations);

      this.lastAnimation = 'rifleIdle';
      this.currentAnimation.play();
      onLoad(player);
    });

    this.hasRifle = true;
    this.aiming = false;
  }

  idle () {
    const idle = `${this.hasRifle ? 'rifle' : 'pistol'}Idle`;

    if (this.aiming) {
      this.lastAnimation = idle;
      return;
    }

    this.currentAnimation.crossFadeTo(this.animations[idle], 0.1, true);
    this.animations[idle].play();
    this.moving = false;

    setTimeout(() => {
      this.setDirection('Idle');
      this.lastAnimation = idle;
      this.currentAnimation.stop();
      this.currentAnimation = this.animations[idle];
    }, 100);

    // anime({
    //   targets: this.character.rotation,
    //   y: this.rotation,
    //   easing: 'linear',
    //   duration: 250
    // });
  }

  aim (aiming) {
    const aim = `${this.hasRifle ? 'rifle' : 'pistol'}Aim`;
    const next = aiming ? aim : this.lastAnimation;

    this.currentAnimation.crossFadeTo(this.animations[next], 0.1, true);
    this.animations[next].play();
    this.aiming = aiming;

    setTimeout(() => {
      this.currentAnimation.stop();
      this.currentAnimation = this.animations[next];
    }, 100);

    // anime({
    //   targets: this.character.rotation,
    //   y: -Math.PI / 1.0,
    //   easing: 'linear',
    //   duration: 250
    // });
  }

  move (directions, run = false) {
    const direction = this.getMoveDirection(...directions);
    const animation = `${this.hasRifle ? 'rifle' : 'pistol'}${direction}`;

    this.currentAnimation.crossFadeTo(this.animations[animation], 0.1, true);
    this.animations[animation].play();

    setTimeout(() => {
      this.moving = true;
      this.running = run;

      this.currentAnimation.stop();
      this.lastAnimation = animation;

      this.setDirection(direction, run, this.aiming);
      this.currentAnimation = this.animations[animation];
    }, 100);
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
