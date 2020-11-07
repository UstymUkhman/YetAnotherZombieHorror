type AnimationAction = import('@three/animation/AnimationAction').AnimationAction;
type Object3D = import('@three/core/Object3D').Object3D;

import { Direction, Directions } from '@/managers/Input';
import { Location, PlayerAnimations } from '@/types';
import { GameEvents } from '@/managers/GameEvents';
import { MathUtils } from '@three/math/MathUtils';
import { Camera } from '@/managers/GameCamera';

import Character from '@/characters/Character';
import { Vector3 } from '@three/math/Vector3';
import { LoopOnce } from '@three/constants';
import type Pistol from '@/weapons/Pistol';

import type Rifle from '@/weapons/Rifle';
import { Config } from '@/config';

const AXIS_X = new Vector3(1, 0, 0);
const AXIS_Y = new Vector3(0, 1, 0);

export default class Player extends Character {
  private currentAnimation!: AnimationAction;
  private moves: Directions = [0, 0, 0, 0];

  private lastAnimation = 'pistolIdle';
  private weapon!: Pistol | Rifle;

  private reloadTimeout?: number;
  private aimTimeout?: number;

  private equipRifle = false;
  private hasRifle = false;

  private reloading = false;
  private shooting = false;
  private aiming = false;

  private hand?: Object3D;
  private pistol?: Pistol;
  private rifle?: Rifle;

  private idleTime = 0;
  private moveTime = 0;
  private aimTime = 0;

  public constructor () {
    super(Config.Player);
  }

  private getMovementAnimation (directions: Directions): PlayerAnimations {
    let direction = directions[Direction.UP] ? 'Forward' : directions[Direction.DOWN] ? 'Backward' : '';

    if (!this.equipRifle && !direction) {
      direction = directions[Direction.LEFT] ? 'Left' : directions[Direction.RIGHT] ? 'Right' : direction;
    } else if (this.equipRifle) {
      direction += directions[Direction.LEFT] ? 'Left' : directions[Direction.RIGHT] ? 'Right' : '';
    }

    return direction as PlayerAnimations || 'Idle';
  }

  private getWeaponAnimation (movement: string): string {
    return `${this.equipRifle ? 'rifle' : 'pistol'}${movement}`;
  }

  private setWeapon (rifle: boolean): void {
    let animation = rifle ?
      this.lastAnimation.replace('pistol', 'rifle') :
      this.lastAnimation.replace('rifle', 'pistol');

    GameEvents.dispatch('weapon:change', rifle);
    this.hand?.remove(this.weapon?.model);

    if (!rifle && !this.animations[animation]) {
      animation = animation.replace(/BackwardLeft|BackwardRight/gm, 'Backward');
      animation = animation.replace(/ForwardLeft|ForwardRight/gm, 'Forward');
    }

    this.currentAnimation.crossFadeTo(this.animations[animation], 0.1, true);
    this.hasRifle = this.equipRifle || rifle;
    this.animations[animation].play();
    this.equipRifle = rifle;

    setTimeout(() => {
      this.currentAnimation.stop();
      this.lastAnimation = animation;
      this.currentAnimation = this.animations[animation];
    }, 100);
  }

  // private isReloading (): boolean {
  //   return this.reloading;
  // }

  // private isShooting (): boolean {
  //   return this.shooting;
  // }

  // private isAiming (): boolean {
  //   return this.aiming;
  // }

  // private isHitting (): boolean {
  //   return this.hitting;
  // }

  // private isRunning (): boolean {
  //   return this.running;
  // }

  // private isMoving (): boolean {
  //   return this.moving;
  // }

  public rotate (x: number, y: number): void {
    const lookDown = y > 0;
    const tilt = this.rotation.y;
    const model = this.getModel();

    model.rotateOnWorldAxis(AXIS_Y, x);

    if ((lookDown && tilt >= -0.2) || (!lookDown && tilt <= 0.1)) {
      model.rotateOnAxis(AXIS_X, y);
    }
  }

  public idle (): void {
    const idle = this.getWeaponAnimation('Idle');
    const idling = this.lastAnimation === idle;
    this.running = this.moving = false;

    if (idling || Date.now() - this.idleTime < 100) return;
    // if (this.aiming || this.hitting || this.reloading || idling) return;

    this.currentAnimation.crossFadeTo(this.animations[idle], 0.1, true);
    this.animations[idle].play();
    this.idleTime = Date.now();

    setTimeout(() => {
      this.lastAnimation = idle;
      this.setAnimation('Idle');

      this.currentAnimation.stop();
      this.currentAnimation = this.animations[idle];
    }, 100);
  }

  public move (directions: Directions): void {
    const direction = this.getMovementAnimation(directions);
    const animation = this.getWeaponAnimation(direction);

    // if (this.aiming || this.hitting || this.lastAnimation === animation) return;
    if (this.lastAnimation === animation || Date.now() - this.moveTime < 100) return;

    // if (this.running) {
    //   !direction.includes('Forward') && this.run(directions, false);
    //   return;
    // }

    this.currentAnimation.crossFadeTo(this.animations[animation], 0.1, true);
    this.animations[animation].play();
    // clearTimeout(this.reloadTimeout);
    // this.weapon.cancelReload();

    this.moveTime = Date.now();
    this.reloading = false;
    this.running = false;
    this.moving = true;

    setTimeout(() => {
      this.currentAnimation.stop();
      this.setAnimation(direction);

      this.lastAnimation = animation;
      this.currentAnimation = this.animations[animation];
    }, 100);
  }

  public run (directions: Directions, running: boolean): void {
    this.running = running;
    // if (this.aiming || this.hitting) return;
    const run = this.getWeaponAnimation('Run');

    GameEvents.dispatch('player:run', running);
    // clearTimeout(this.reloadTimeout);

    // this.weapon.cancelReload();
    // this.reloading = false;

    // Camera.runAnimation(this.isRunning.bind(this), running);

    // if (!running || this.lastAnimation === run) {
    //   const idling = !(directions as unknown as number[]).includes(1);

    //   if (!this.aiming && idling) {
    //     setTimeout(this.idle.bind(this), 150);
    //   } else {
    //     this.move(directions);
    //     this.moving = true;
    //   }

    //   return;
    // }

    this.currentAnimation.crossFadeTo(this.animations[run], 0.1, true);
    this.animations[run].play();

    setTimeout(() => {
      this.setAnimation('Run');
      this.lastAnimation = run;

      this.currentAnimation.stop();
      this.currentAnimation = this.animations[run];
    }, 100);
  }

  /* public aim (aiming: boolean): void {
    let duration = 400;

    const running = this.running;
    const elapse = Date.now() - this.aimTime;
    const move = !aiming && (this.moves as unknown as number[]).includes(1);

    this.running && GameEvents.dispatch('run', !aiming);
    this.weapon.aim = this.aiming = aiming;

    if (aiming || elapse > 900)
      this.weapon.setAim(aiming, Math.max(duration - 100, 0));

    else {
      duration = Math.min(elapse, 400);
      this.running = move && running;
      this.cancelAim(elapse < 100);
      this.weapon.cancelAim();
    }

    if (move) {
      this.running
        ? this.run(this.moves, !!this.moves[0])
        : this.move(this.moves);
    }

    else {
      let next: string;

      if (aiming && this.equipRifle) {
        this.aimTime = Date.now();
        next = 'rifleAim';
      } else {
        next = this.getWeaponAnimation('Idle');
        this.aimTime = 0;
      }

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

            this.setAnimation('Idle');
            this.currentAnimation.stop();
            this.currentAnimation = this.animations[next];
          }
        }, 100) as unknown as number;
      }
    }

    Camera.aimAnimation(this.running, this.moving, aiming, duration);
  }

  private cancelAim (instant: boolean): void {
    if (!this.running) this.idle();
    clearTimeout(this.aimTimeout);
    Camera.stopAnimations();

    if (instant) {
      this.currentAnimation.stop();
      this.running = false;
      this.moving = false;
    }
  } */

  public reload (): void { return; }

  public async loadCharacter (): Promise<Object3D> {
    const model = (await this.load()).scene;

    this.hand = model.getObjectByName('swatRightHand');
    this.currentAnimation = this.animations.pistolIdle;

    this.animations.rifleReload.clampWhenFinished = true;
    this.animations.rifleAim.clampWhenFinished = true;
    this.animations.death.clampWhenFinished = true;

    this.animations.rifleReload.setLoop(LoopOnce, 1);
    this.animations.rifleAim.setLoop(LoopOnce, 1);
    this.animations.death.setLoop(LoopOnce, 1);

    !Config.freeCamera && Camera.setTo(model);
    this.currentAnimation.play();
    return this.object;
  }

  public setPistol (targets: Array<Object3D>, pistol: Pistol): void {
    this.setWeapon(false);
    this.weapon = pistol;
    this.pistol = pistol;

    pistol.targets = targets;
    this.hand?.add(pistol.model);
  }

  public setRifle (targets: Array<Object3D>, rifle: Rifle): void {
    this.setWeapon(true);
    this.weapon = rifle;
    this.rifle = rifle;

    rifle.targets = targets;
    this.hand?.add(rifle.model);
  }

  public changeWeapon (): void {
    if (this.hasRifle && !this.aiming && !this.reloading) {
      const targets = this.weapon.targets;

      !this.equipRifle
        ? this.setRifle(targets, this.rifle as Rifle)
        : this.setPistol(targets, this.pistol as Pistol);
    }
  }

  public update (delta: number): void {
    super.update(delta);
  }

  public get location (): Location {
    const { x, z } = this.rotation;

    return {
      position: this.position,
      rotation: MathUtils.radToDeg(
        Math.atan2(-x, z)
      )
    };
  }

  public get uuid (): string {
    return this.object.uuid;
  }
}
