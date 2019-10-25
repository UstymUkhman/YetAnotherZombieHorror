import { Object3D } from '@three/core/Object3D';
import Character from '@/characters/Character';
import PLAYER from '@/assets/gltf/player.glb';

import { Vector3 } from '@three/math/Vector3';
import { LoopOnce } from '@three/constants';
import config from '@/assets/player.json';
import anime from 'animejs';

const AIM_CAMERA = new Vector3(-0.75, 3, -1.25);
const RUN_CAMERA = new Vector3(-1.5, 3, -5);
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

      this.character = new Object3D();
      this.character.add(player);
      onLoad(this.character);
    });

    this._cameraPosition = new Vector3();
    this._cameraRotation = new Vector3();

    this.shakeDirection = 0;
    this.aimTimeout = null;
    this.shooting = false;
    this.moveTime = null;

    this.hasRifle = true;
    this.aimTime = null;
    this.aiming = false;
    this.weapon = null;
  }

  setWeapon (weapon, colliders, rifle = false) {
    const hand = this.character.getObjectById(102, true);

    this.weapon = weapon;
    this.hasRifle = rifle;

    hand.add(this.weapon.arm);
    weapon.targets = colliders;
  }

  idle () {
    if (this.lastAnimation === this._idle || this.aiming) return;

    this.currentAnimation.crossFadeTo(this.animations[this._idle], 0.1, true);
    this.animations[this._idle].play();

    this.running = false;
    this.moving = false;

    setTimeout(() => {
      this.setDirection('Idle');
      this.currentAnimation.stop();
      this.lastAnimation = this._idle;
      this.currentAnimation = this.animations[this._idle];
    }, 100);
  }

  move (directions) {
    const now = Date.now();
    const direction = this.getMoveDirection(...directions);
    const animation = `${this.hasRifle ? 'rifle' : 'pistol'}${direction}`;

    if (this.aiming || this.lastAnimation === animation) return;
    if (this.running && direction.includes('Forward')) return;
    if (now - this.moveTime < 150) return;

    this.currentAnimation.crossFadeTo(this.animations[animation], 0.1, true);
    this.animations[animation].play();

    this.running = false;
    this.moveTime = now;
    this.moving = true;

    setTimeout(() => {
      this.currentAnimation.stop();
      this.setDirection(direction);

      this.lastAnimation = animation;
      this.currentAnimation = this.animations[animation];
    }, 100);
  }

  getMoveDirection (w, a, s, d) {
    let direction = w ? 'Forward' : s ? 'Backward' : '';
    direction += a ? 'Left' : d ? 'Right' : '';
    return direction || 'Idle';
  }

  run (directions, running = this.running) {
    this.moving = running;
    this.running = running;

    if (running && this.aiming) return;
    const run = `${this.hasRifle ? 'rifle' : 'pistol'}Run`;

    this._runCameraAnimation();
    this.shakeDirection = ~~this.running;
    this._shakeCameraAnimation(this.running);

    if (!running || this.lastAnimation === run) {
      if (!this.aiming && !directions.includes(1)) {
        setTimeout(() => { this.idle(); }, 150);
      } else {
        this.move(directions);
      }

      return;
    }

    this.currentAnimation.crossFadeTo(this.animations[run], 0.1, true);
    this.animations[run].play();

    setTimeout(() => {
      this.setDirection('Run');
      this.lastAnimation = run;
      this.currentAnimation.stop();
      this.currentAnimation = this.animations[run];
    }, 100);
  }

  _runCameraAnimation () {
    const x = this.running ? RUN_CAMERA.x : CAMERA.x;
    const z = this.running ? RUN_CAMERA.z : CAMERA.z;

    const delay = this.running ? 100 : 0;

    anime({
      targets: this.cameraPosition,
      easing: 'easeInOutQuad',
      duration: 250,
      delay: delay,
      x: x,
      z: z
    });
  }

  _shakeCameraAnimation (first = false) {
    if (!this.running) {
      this.shakeDirection = 0;

      // anime({
      //   targets: this.cameraRotation,
      //   easing: 'linear',
      //   duration: 150,
      //   delay: 350,
      //   y: Math.PI
      // });

      return;
    }

    const torque = this.shakeDirection * 0.05;
    const oscillation = this.shakeDirection;
    const speed = first ? 150 : 300;
    const delay = first ? 350 : 0;

    anime({
      targets: this.cameraRotation,
      y: Math.PI + torque,
      easing: 'linear',
      duration: speed,
      delay: delay,

      complete: () => {
        this.shakeDirection = oscillation * -1;
        this._shakeCameraAnimation();
      }
    });
  }

  /* getMoveAnimation (animation) {
    const weapon = this.hasRifle ? 'rifle' : 'pistol';
    return animation.replace(weapon, '');
  } */

  aim (aiming, directions) {
    // if (this.moving || this.running) return;
    const animationDelay = aiming ? 100 : 0;
    const aimElapse = Date.now() - this.aimTime;
    const cancelAim = !aiming && aimElapse < 900;
    const move = !aiming && directions.includes(1);

    const running = this.running;
    this.weapon.aiming = aiming;
    this.aiming = aiming;
    let duration = 400;

    if (cancelAim) {
      this._cancelAimAnimation(aimElapse < 100);
      duration = Math.min(aimElapse, 400);
      this.running = move && running;
      this.weapon.cancelAim();
    } else if (!move) {
      const next = aiming ? this._aim : this._idle;
      this.aimTime = aiming ? Date.now() : null;

      if (this.lastAnimation !== next) {
        this.currentAnimation.crossFadeTo(this.animations[next], 0.1, true);
        this.animations[next].play();

        this.aimTimeout = setTimeout(() => {
          this.moving = false;
          this.lastAnimation = next;

          this.setDirection('Idle');
          this.currentAnimation.stop();
          this.currentAnimation = this.animations[next];
        }, 100);
      }
    }

    if (move) {
      this.running ? this.run(directions) : this.move(directions);
    }

    if (!this.running) {
      this._aimCameraAnimation(aiming, duration, animationDelay);
    }

    if (!cancelAim) {
      this.weapon.aim(aiming, duration - 100, animationDelay);
    }
  }

  _aimCameraAnimation (aiming, duration, delay) {
    const x = aiming ? AIM_CAMERA.x : CAMERA.x;
    const z = aiming ? AIM_CAMERA.z : CAMERA.z;

    anime({
      targets: this.cameraPosition,
      easing: 'easeInOutQuad',
      duration: duration,
      delay: delay,
      x: x,
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

  shoot (now) {
    this.shooting = now;

    if (now) {
      this.weapon.shoot(this.character.position);
      return this.weapon.recoil;
    }

    return { x: 0, y: 0 };
  }

  /* update (delta) {
    super.update(delta);
  } */

  addCamera (camera) {
    this._cameraPosition = camera.position;
    this._cameraRotation = camera.rotation;
    this.character.add(camera);
  }

  get _idle () {
    return `${this.hasRifle ? 'rifle' : 'pistol'}Idle`;
  }

  get _aim () {
    return `${this.hasRifle ? 'rifle' : 'pistol'}Aim`;
  }

  get cameraPosition () {
    return this._cameraPosition;
  }

  get cameraRotation () {
    return this._cameraRotation;
  }
};
