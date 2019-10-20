import { Object3D } from '@three/core/Object3D';
import PLAYER from '@/assets/gltf/player.glb';
import { Vector3 } from '@three/math/Vector3';
import { LoopOnce } from '@three/constants';

import config from '@/assets/player.json';
import Character from '@/Character';
import anime from 'animejs';

const AIM_CAMERA = new Vector3(-1, 3, -1.5);
const CAMERA = new Vector3(-1.25, 2.75, -4);

export default class Player extends Character {
  constructor (onLoad) {
    super(PLAYER, config, player => {
      this.currentAnimation = this.animations.rifleIdle;

      this.animations.rifleAim.clampWhenFinished = true;
      this.animations.death.clampWhenFinished = true;

      this.animations.rifleAim.setLoop(LoopOnce);
      this.animations.death.setLoop(LoopOnce);

      // console.log(this.animations);

      this.lastAnimation = 'rifleIdle';
      this.currentAnimation.play();

      this.character = new Object3D();
      this.character.add(player);
      onLoad(this.character);
    });

    this._camera = new Vector3();
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

    const x = aiming ? AIM_CAMERA.x : CAMERA.x;
    const y = aiming ? AIM_CAMERA.y : CAMERA.y;
    const z = aiming ? AIM_CAMERA.z : CAMERA.z;

    anime({
      delay: aiming ? 100 : 0,
      easing: 'easeInOutQuad',
      targets: this.camera,
      duration: 400,

      x: x,
      y: y,
      z: z
    });
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

  addCamera (camera) {
    this._camera = camera.position;
    this.character.add(camera);
  }

  get camera () {
    return this._camera;
  }
};
