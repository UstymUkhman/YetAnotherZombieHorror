import { Object3D } from '@three/core/Object3D';
import Character from '@/characters/Character';
import PLAYER from '@/assets/gltf/player.glb';

import { Vector3 } from '@three/math/Vector3';
import { LoopOnce } from '@three/constants';
import config from '@/assets/player.json';

import AK47 from '@/weapons/AK47';
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
    this.aimTimeout = null;
    this.hasRifle = true;
    this.weapon = null;

    this.aimTime = null;
    this.aiming = false;
  }

  setWeapon (ak = true) {
    this.hasRifle = ak;

    if (ak) {
      this.weapon = new AK47(rifle => {
        this.character.getObjectById(102, true).add(rifle);
      });
    }
  }

  idle () {
    const idle = `${this.hasRifle ? 'rifle' : 'pistol'}Idle`;

    if (this.aiming) {
      this.lastAnimation = idle;
      return;
    }

    this.currentAnimation.crossFadeTo(this.animations[idle], 0.1, true);
    this.animations[idle].play();
    this.running = false;
    this.moving = false;

    setTimeout(() => {
      this.setDirection('Idle');
      this.lastAnimation = idle;
      this.currentAnimation.stop();
      this.currentAnimation = this.animations[idle];
    }, 100);
  }

  aim (aiming) {
    const aim = `${this.hasRifle ? 'rifle' : 'pistol'}Aim`;
    const aimElapse = Date.now() - this.aimTime;
    const delay = aiming ? 100 : 0;
    let duration = 400;

    if (!aiming && aimElapse < 900) {
      this._cancelAimAnimation(aim, aimElapse > 100);
      duration = Math.min(aimElapse, 400);
    } else {
      const next = aiming ? aim : this.lastAnimation;

      this.currentAnimation.crossFadeTo(this.animations[next], 0.1, true);
      this.aimTime = aiming ? Date.now() : null;
      this.animations[next].play();
      this.aiming = aiming;

      this.aimTimeout = setTimeout(() => {
        this.setDirection('Idle');
        this.currentAnimation.stop();
        this.currentAnimation = this.animations[next];
      }, 100);
    }

    const x = aiming ? AIM_CAMERA.x : CAMERA.x;
    const y = aiming ? AIM_CAMERA.y : CAMERA.y;
    const z = aiming ? AIM_CAMERA.z : CAMERA.z;

    this.weapon.aim(aiming, duration, delay);

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

  _cancelAimAnimation (animation, immediate) {
    const next = immediate ? this.animations[this.lastAnimation] : this.currentAnimation;
    const current = immediate ? this.currentAnimation : this.animations[animation];

    current.crossFadeTo(next, 0.1, true);
    clearTimeout(this.aimTimeout);
    anime.running.length = 0;
    next.play();

    setTimeout(() => {
      current.stop();
      this.setDirection('Idle');
      if (immediate) this.currentAnimation = next;
    }, 100);
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

      this.setDirection(direction);
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
