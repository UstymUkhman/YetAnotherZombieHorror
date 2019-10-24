import { Object3D } from '@three/core/Object3D';
import Character from '@/characters/Character';
import PLAYER from '@/assets/gltf/player.glb';

import { Vector3 } from '@three/math/Vector3';
import { LoopOnce } from '@three/constants';
import config from '@/assets/player.json';
import anime from 'animejs';

const AIM_CAMERA = new Vector3(-0.75, 3, -1.25);
const CAMERA = new Vector3(-1.25, 3, -3);

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
      this.lastDirection = 'Idle';

      this.character = new Object3D();
      this.character.add(player);
      onLoad(this.character);
    });

    this._camera = new Vector3();
    this.aimTimeout = null;
    this.hasRifle = true;
    this.weapon = null;

    this.aimTime = null;
    this.aiming = false;
  }

  setWeapon (weapon, colliders, rifle = false) {
    const hand = this.character.getObjectById(102, true);

    this.weapon = weapon;
    this.hasRifle = rifle;

    hand.add(this.weapon.arm);
    weapon.targets = colliders;
  }

  idle () {
    if (this.lastAnimation === this._idle || this.aiming) {
      return false;
    }

    this.running = false;
    this.moving = false;

    this.currentAnimation.crossFadeTo(this.animations[this._idle], 0.1, true);
    this.animations[this._idle].play();

    setTimeout(() => {
      this.setDirection('Idle');
      this.lastDirection = 'Idle';
      this.currentAnimation.stop();

      this.lastAnimation = this._idle;
      this.currentAnimation = this.animations[this._idle];
    }, 100);

    return true;
  }

  aim (aiming) {
    const aimElapse = Date.now() - this.aimTime;
    const cancelAim = !aiming && aimElapse < 900;

    this.weapon.aiming = aiming;
    this.aiming = aiming;
    let duration = 400;

    if (cancelAim) {
      this._cancelAimAnimation(aimElapse < 100);
      duration = Math.min(aimElapse, 400);
      this.weapon.cancelAim();
    } else {
      const next = aiming ? this._aim : this._idle;
      this.aimTime = aiming ? Date.now() : null;

      if (this.lastAnimation !== next) {
        this.currentAnimation.crossFadeTo(this.animations[next], 0.1, true);
        this.animations[next].play();

        this.aimTimeout = setTimeout(() => {
          this.setDirection('Idle');
          this.lastAnimation = next;
          this.currentAnimation.stop();
          this.currentAnimation = this.animations[next];
        }, 100);
      }
    }

    this._aimCameraAnimation(aiming, duration, !cancelAim);
  }

  _aimCameraAnimation (aiming, duration, cancel) {
    const x = aiming ? AIM_CAMERA.x : CAMERA.x;
    const y = aiming ? AIM_CAMERA.y : CAMERA.y;
    const z = aiming ? AIM_CAMERA.z : CAMERA.z;

    const delay = aiming ? 100 : 0;

    if (cancel) {
      this.weapon.aim(aiming, duration - 100, delay);
    }

    anime({
      easing: 'easeInOutQuad',
      targets: this.camera,
      duration: duration,
      delay: delay,

      x: x,
      y: y,
      z: z
    });
  }

  _cancelAimAnimation (immediate) {
    clearTimeout(this.aimTimeout);
    anime.running.length = 0;
    this.idle();

    if (immediate) {
      this.currentAnimation.stop();

      this.running = false;
      this.moving = false;
    }
  }

  move (directions, run = false) {
    const direction = this.getMoveDirection(...directions);
    const animation = `${this.hasRifle ? 'rifle' : 'pistol'}${direction}`;

    if (this.aiming || this.lastAnimation === animation) return;

    this.currentAnimation.crossFadeTo(this.animations[animation], 0.1, true);
    this.animations[animation].play();

    this.lastAnimation = animation;
    this.lastDirection = direction;

    this.running = run;
    this.moving = true;

    setTimeout(() => {
      this.currentAnimation.stop();
      this.setDirection(direction);
      this.currentAnimation = this.animations[animation];
    }, 100);
  }

  getMoveDirection (w, a, s, d) {
    let direction = w ? 'Forward' : s ? 'Backward' : '';
    direction += a ? 'Left' : d ? 'Right' : '';
    return direction || 'Idle';
  }

  /* getMoveAnimation (animation) {
    const weapon = this.hasRifle ? 'rifle' : 'pistol';
    return animation.replace(weapon, '');
  } */

  update (delta) {
    super.update(delta);
  }

  addCamera (camera) {
    this._camera = camera.position;
    this.character.add(camera);
  }

  get _idle () {
    return `${this.hasRifle ? 'rifle' : 'pistol'}Idle`;
  }

  get _aim () {
    return `${this.hasRifle ? 'rifle' : 'pistol'}Aim`;
  }

  get camera () {
    return this._camera;
  }
};
