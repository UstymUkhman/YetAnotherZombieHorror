import { Object3D } from '@three/core/Object3D';
import Character from '@/characters/Character';
import { Vector3 } from '@three/math/Vector3';
import { LoopOnce } from '@three/constants';

import PLAYER from '@/assets/models/player.glb';
import config from '@/characters/player.json';
import Events from '@/managers/Events';
import anime from 'animejs';

const DEATH_CAMERA_ROTATION = new Vector3(Math.PI / 2, Math.PI, 0);
const DEATH_CAMERA_POSITION = new Vector3(-0.5, 12, -0.5);

const AIM_CAMERA = new Vector3(-0.75, 3, -1.25);
const RUN_CAMERA = new Vector3(-2.5, 3, -7);
const CAMERA = new Vector3(-1.5, 3, -3.5);

export default class Player extends Character {
  constructor (onLoad) {
    super(PLAYER, config, character => {
      this._hand = character.getObjectByName('swatRightHand');

      this.animations.rifleReload.clampWhenFinished = true;
      this.animations.rifleAim.clampWhenFinished = true;
      this.animations.death.clampWhenFinished = true;

      this.animations.rifleReload.setLoop(LoopOnce);
      this.animations.rifleAim.setLoop(LoopOnce);
      this.animations.death.setLoop(LoopOnce);

      this.currentAnimation = this.animations.pistolIdle;
      this.lastAnimation = 'pistolIdle';
      this.currentAnimation.play();

      this.character = new Object3D();
      this.character.add(character);
      onLoad(this.character);
    });

    this._cameraPosition = new Vector3();
    this._cameraRotation = new Vector3();

    this.reloadTimeout = null;
    this.deathCamera = false;
    this.shakeDirection = 0;
    this.equipRifle = false;
    this.aimTimeout = null;
    this.hasRifle = false;

    this.reloading = false;
    this.shooting = false;
    this.hitting = false;
    this.aiming = false;

    this.moveTime = null;
    this.idleTime = null;
    this.aimTime = null;

    this.weapon = null;
    this.pistol = null;
    this.ak47 = null;
  }

  addCamera (camera) {
    this._cameraPosition = camera.position;
    this._cameraRotation = camera.rotation;
    this.character.add(camera);
  }

  setWeapon (colliders, weapon, rifle) {
    if (this.weapon) {
      let animation = rifle ?
        this.lastAnimation.replace('pistol', 'rifle') :
        this.lastAnimation.replace('rifle', 'pistol');

      this._hand.remove(this.weapon.arm);
      Events.dispatch('change', rifle);
      delete this.weapon;

      if (!rifle && !this.animations[animation]) {
        animation = animation.replace(/BackwardLeft|BackwardRight/gm, 'Backward');
        animation = animation.replace(/ForwardLeft|ForwardRight/gm, 'Forward');
      }

      this.currentAnimation.crossFadeTo(this.animations[animation], 0.1, true);
      this.animations[animation].play();

      setTimeout(() => {
        this.currentAnimation.stop();
        this.lastAnimation = animation;
        this.currentAnimation = this.animations[animation];
      }, 100);
    }

    rifle ? this.ak47 = weapon : this.pistol = weapon;
    this.hasRifle = this.equipRifle || rifle;

    weapon.targets = colliders;
    this._hand.add(weapon.arm);

    this.equipRifle = rifle;
    this.weapon = weapon;
  }

  changeWeapon () {
    if (!this.hasRifle || this.aiming || this.reloading) return;
    const weapon = this.equipRifle ? this.pistol : this.ak47;
    const colliders = this.weapon.targets;

    weapon.setToPlayer(false);
    this.setWeapon(colliders, weapon, !this.equipRifle);
  }

  idle () {
    this.moving = false;
    this.running = false;
    const now = Date.now();

    if (now - this.idleTime < 150) return;
    const idle = this.lastAnimation === this._idle;
    if (this.aiming || this.hitting || this.reloading || idle) return;

    this.currentAnimation.crossFadeTo(this.animations[this._idle], 0.1, true);
    this.animations[this._idle].play();
    // clearTimeout(this.reloadTimeout);
    // this.weapon.cancelReload();

    // this.moving = false;
    // this.running = false;
    // this.reloading = false;

    this.idleTime = now;
    this.shakeDirection = 0;

    this._runCameraAnimation();
    this._shakeCameraAnimation();

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
    const animation = `${this.equipRifle ? 'rifle' : 'pistol'}${direction}`;
    const sameAnimation = this.lastAnimation === animation;

    // this.moving = true;

    if (this.aiming || this.hitting || /* this.reloading || */ sameAnimation) return;
    if (now - this.moveTime < 150) return;

    if (this.running) {
      if (!direction.includes('Forward')) {
        this.run(directions, false);
      }

      return;
    }

    this.currentAnimation.crossFadeTo(this.animations[animation], 0.1, true);
    this.animations[animation].play();
    clearTimeout(this.reloadTimeout);
    this.weapon.cancelReload();

    this.reloading = false;
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

    if (!this.equipRifle && !direction) {
      direction = a ? 'Left' : d ? 'Right' : direction;
    } else if (this.equipRifle) {
      direction += a ? 'Left' : d ? 'Right' : '';
    }

    return direction || 'Idle';
  }

  run (directions, running) {
    this.moving = running;
    this.running = running;

    if (this.aiming || this.hitting /* || this.reloading */) return;
    const run = `${this.equipRifle ? 'rifle' : 'pistol'}Run`;

    // this.moving = running;
    this._runCameraAnimation();
    this.shakeDirection = ~~running;

    clearTimeout(this.reloadTimeout);
    Events.dispatch('run', running);
    this.weapon.cancelReload();
    this.reloading = false;

    setTimeout(() => {
      this._shakeCameraAnimation();
    }, running ? 500 : 0);

    if (!running || this.lastAnimation === run) {
      if (!this.aiming && !directions.includes(1)) {
        setTimeout(() => { this.idle(); }, 150);
      } else {
        this.move(directions);
        this.moving = true;
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
      easing: 'easeOutQuad',
      duration: 300,
      delay: delay,
      x: x,
      z: z
    });
  }

  _shakeCameraAnimation () {
    const speed = this.shakeDirection || !this.running ? 250 : 500;
    const torque = this.shakeDirection * 0.025;
    const oscillation = this.shakeDirection;

    anime({
      targets: this.cameraRotation,
      y: Math.PI + torque,
      easing: 'linear',
      duration: speed,

      complete: () => {
        if (this.running && !this.aiming) {
          this.shakeDirection = oscillation * -1;
          this._shakeCameraAnimation();
        }
      }
    });
  }

  aim (aiming) {
    const animationDelay = aiming ? 100 : 0;
    const aimElapse = Date.now() - this.aimTime;
    const cancelAim = !aiming && aimElapse < 900;
    const move = !aiming && this.lastDirections.includes(1);

    const running = this.running;
    this.weapon.aiming = aiming;
    this.aiming = aiming;
    let duration = 400;

    if (this.running) {
      Events.dispatch('run', !aiming);
    }

    if (cancelAim) {
      this._cancelAimAnimation(aimElapse < 100);
      duration = Math.min(aimElapse, 400);
      this.running = move && running;
      this.weapon.cancelAim();
    } else if (!move) {
      const next = aiming && this.equipRifle ? 'rifleAim' : this._idle;
      this.aimTime = aiming && this.equipRifle ? Date.now() : null;

      if (this.lastAnimation !== next) {
        this.currentAnimation.crossFadeTo(this.animations[next], 0.1, true);
        clearTimeout(this.reloadTimeout);
        this.animations[next].play();
        this.weapon.cancelReload();
        this.reloading = false;

        this.aimTimeout = setTimeout(() => {
          if (this.lastAnimation !== next) {
            this.moving = false;
            this.lastAnimation = next;

            this.setDirection('Idle');
            this.currentAnimation.stop();
            this.currentAnimation = this.animations[next];
          }
        }, 100);
      }
    }

    if (move) {
      this.running ? this.run(this.lastDirections, !!this.lastDirections[0]) : this.move(this.lastDirections);
    }

    this._aimCameraAnimation(aiming, duration, animationDelay);

    if (this.equipRifle && !cancelAim) {
      this.weapon.aim(aiming, duration - 100, animationDelay);
    }
  }

  _aimCameraAnimation (aiming, duration, delay) {
    if (this.running) {
      anime({
        targets: this.cameraRotation,
        easing: 'linear',
        duration: 250,
        y: Math.PI
      });
    }

    if (this.running && this.moving && !aiming) return;

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
    if (!this.running) this.idle();
    clearTimeout(this.aimTimeout);
    anime.running.length = 0;

    if (immediate) {
      this.currentAnimation.stop();
      this.running = false;
      this.moving = false;
    }
  }

  shoot (now) {
    this.shooting = now;
    const recoil = { x: 0, y: 0 };
    const shooted = this.weapon.magazine > 0;

    if (now) {
      Events.dispatch('shoot', now);
      this.weapon.shoot(this.character.position);
      return shooted ? this.weapon.recoil : recoil;
    }

    return recoil;
  }

  reload () {
    // this.moving = false;
    // this.running = false;

    const noAmmo = !this.weapon.ammo;
    const fullMagazine = this.weapon.magazine >= 30;
    if (this.reloading || this.hitting || fullMagazine || noAmmo) return;

    // const running = this.running;
    // const aiming = this.aiming;

    if (this.running) {
      Events.dispatch('run', false);
    }

    this.currentAnimation.crossFadeTo(this.animations.rifleReload, 0.1, true);
    this.animations.rifleReload.play();
    this.weapon.startReload();

    const running = this.running;
    this.shakeDirection = 0;
    this.reloading = true;
    this.running = false;
    // this.aiming = false;

    if (this.aiming) {
      this._aimCameraAnimation(false, 400, 0);
    } else if (running) {
      this._runCameraAnimation();
      this._shakeCameraAnimation();
    }

    setTimeout(() => {
      this.setDirection('Idle');
      this.currentAnimation.stop();
      this.lastAnimation = 'rifleReload';
      this.currentAnimation = this.animations.rifleReload;
    }, 100);

    this.reloadTimeout = setTimeout(() => {
      this.weapon.addAmmo(true);

      setTimeout(() => {
        if (!this.alive) return;
        this.reloading = false;

        if (this.moving || !this.aiming) {
          running ? this.run(this.lastDirections, !!this.lastDirections[0]) : this.move(this.lastDirections);
        } else {
          this.aiming ? this.aim(true) : this.idle();
        }
      }, 1000);
    }, 2000);
  }

  hit (direction, delay) {
    const amount = delay > 750 ? 10 : delay > 500 ? 25 : 50;
    this.health = Math.max(this.health - amount, 0);

    setTimeout(this.checkIfAlive.bind(this), 500);
    Events.dispatch('hit', this.health);

    if (!this.alive || this.hitting) return;
    const hitDuration = this.equipRifle ? 1000 : 1500;
    const hitAnimation = this.getHitAnimation(direction);

    this.currentAnimation.crossFadeTo(this.animations[hitAnimation], 0.1, true);
    this.animations[hitAnimation].play();
    if (this.aiming) this.aim(false);

    clearTimeout(this.reloadTimeout);
    this.weapon.cancelReload();

    this.reloading = false;
    this.running = false;
    this.hitting = true;
    this.moving = false;

    setTimeout(() => {
      this.setDirection('Idle');
      this.currentAnimation.stop();
      this.lastAnimation = hitAnimation;
      this.currentAnimation = this.animations[hitAnimation];
    }, 100);

    setTimeout(() => {
      if (!this.alive) return;
      this.hitting = false;

      if (this.moving) {
        this.running ? this.run(this.lastDirections, !!this.lastDirections[0]) : this.move(this.lastDirections);
      } else {
        this.idle();
      }
    }, hitDuration);

    return this.health <= 0;
  }

  death () {
    this.currentAnimation.crossFadeTo(this.animations.death, 0.5, true);
    clearTimeout(this.reloadTimeout);
    this.animations.death.play();
    this.weapon.cancelReload();

    this._deathCameraAnimation();
    Events.dispatch('death');

    this.reloading = false;
    this.shooting = false;
    this.hitting = false;
    this.running = false;
    this.aiming = false;
    this.moving = false;

    setTimeout(() => {
      this.setDirection('Idle');
      this.currentAnimation.stop();
      this.currentAnimation = this.animations.death;
    }, 500);
  }

  _deathCameraAnimation () {
    anime({
      targets: this.cameraPosition,
      x: DEATH_CAMERA_POSITION.x,
      y: DEATH_CAMERA_POSITION.y,
      easing: 'easeOutQuad',
      duration: 3000
    });

    anime({
      targets: this.cameraPosition,
      easing: 'easeOutQuad',
      duration: 1500,
      z: -5,

      complete: () => {
        anime({
          targets: this.cameraPosition,
          z: DEATH_CAMERA_POSITION.z,
          easing: 'easeOutQuad',
          duration: 1500,
        });
      }
    });

    anime({
      targets: this.cameraRotation,
      x: DEATH_CAMERA_ROTATION.x,
      y: DEATH_CAMERA_ROTATION.y,
      z: DEATH_CAMERA_ROTATION.z,
      easing: 'easeOutQuad',
      duration: 3000,

      complete: () => {
        this.deathCamera = true;
      }
    });
  }

  update (delta) {
    super.update(delta);

    if (this.deathCamera) {
      this.cameraRotation.z += 0.005;
    }
  }

  getHitAnimation (direction) {
    return `${this.equipRifle ? 'rifle' : 'pistol'}${direction}Hit`;
  }

  get _idle () {
    return `${this.equipRifle ? 'rifle' : 'pistol'}Idle`;
  }

  get cameraPosition () {
    return this._cameraPosition;
  }

  get cameraRotation () {
    return this._cameraRotation;
  }

  get hitAmount () {
    return this.weapon.hit;
  }
};
