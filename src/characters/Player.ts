type AnimationAction = import('@three/animation/AnimationAction').AnimationAction;
type Object3D = import('@three/core/Object3D').Object3D;
type Vector2 = import('@three/math/Vector2').Vector2;

import { Direction, Directions } from '@/managers/Input';
import { GameEvents } from '@/managers/GameEvents';
import { MathUtils } from '@three/math/MathUtils';
import { Camera } from '@/managers/GameCamera';

import Character from '@/characters/Character';
import { Vector3 } from '@three/math/Vector3';

import type Pistol from '@/weapons/Pistol';
import type Rifle from '@/weapons/Rifle';

import { clamp } from '@/utils/Number';
import { Config } from '@/config';

export type Location = {
  position: Vector3
  rotation: number
};

export class Player extends Character {
  private readonly currentPosition = new Vector3();
  private readonly currentRotation = new Vector3();

  private currentAnimation!: AnimationAction;
  private lastAnimation = 'pistolIdle';
  private weapon!: Pistol | Rifle;

  private reloadTimeout?: number;
  private aimTimeout?: number;

  private equipRifle = false;
  private hasRifle = false;

  private moveTime?: number;
  private idleTime?: number;
  private aimTime?: number;

  private reloading = false;
  private shooting = false;

  private hitting = false;
  private aiming = false;

  private hand?: Object3D;
  private pistol?: Pistol;
  private rifle?: Rifle;

  public constructor () {
    super(Config.Player);

    if (!Config.freeCamera) {
      Camera.setTo(this.object);
    }
  }

  private getMovementAnimation (directions: Directions): Config.Animation {
    let direction = directions[Direction.UP] ? 'Forward' : directions[Direction.DOWN] ? 'Backward' : '';

    if (!this.equipRifle && !direction) {
      direction = directions[Direction.LEFT] ? 'Left' : directions[Direction.RIGHT] ? 'Right' : direction;
    } else if (this.equipRifle) {
      direction += directions[Direction.LEFT] ? 'Left' : directions[Direction.RIGHT] ? 'Right' : '';
    }

    return direction as Config.Animation || 'Idle';
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

  private isRunning (): boolean {
    return this.running && !this.aiming;
  }

  public rotate (rotation: Vector2): void {
    const y = clamp(
      Camera.rotation.x + rotation.y / -400,
      -0.1, ~~this.aiming * 0.2 + 0.2
    );

    Camera.object.rotation.x = y;
    super.turn(rotation.x /*, y */);
  }

  public idle (): void {
    const idle = this.getWeaponAnimation('Idle');
    const idling = this.lastAnimation === idle;

    this.running = this.moving = false;

    if (this.idleTime && Date.now() - this.idleTime < 150) return;
    if (this.aiming || this.hitting || this.reloading || idling) return;

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

    if (this.aiming || this.hitting || this.lastAnimation === animation) return;
    if (this.moveTime && Date.now() - this.moveTime < 150) return;

    if (this.running) {
      !direction.includes('Forward') && this.run(directions, false);
      return;
    }

    this.currentAnimation.crossFadeTo(this.animations[animation], 0.1, true);
    this.animations[animation].play();
    clearTimeout(this.reloadTimeout);
    this.weapon.cancelReload();

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
    this.moving = this.running = running;
    if (this.aiming || this.hitting) return;
    const run = this.getWeaponAnimation('Run');

    GameEvents.dispatch('player:run', running);
    clearTimeout(this.reloadTimeout);

    this.weapon.cancelReload();
    this.reloading = false;

    Camera.runAnimation(this.isRunning.bind(this), running);

    if (!running || this.lastAnimation === run) {
      const idling = !Object.values(directions).includes(1);

      if (!this.aiming && idling) {
        setTimeout(this.idle.bind(this), 150);
      } else {
        this.move(directions);
        this.moving = true;
      }

      return;
    }

    this.currentAnimation.crossFadeTo(this.animations[run], 0.1, true);
    this.animations[run].play();

    setTimeout(() => {
      this.setAnimation('Run');
      this.lastAnimation = run;

      this.currentAnimation.stop();
      this.currentAnimation = this.animations[run];
    }, 100);
  }

  public async loadCharacter (): Promise<Object3D> {
    const model = (await this.load()).scene;

    this.currentPosition.copy(this.object.position);
    this.object.rotation.toVector3(this.currentRotation);

    this.currentAnimation = this.animations.pistolIdle;
    this.hand = model.getObjectByName('swatRightHand');

    this.currentAnimation.play();
    return this.object;
  }

  public addSounds (sounds: Array<AudioBuffer>): void {
    const listener = Camera.listener;
    sounds.forEach(sound => this.object.add(this.createAudio(sound, listener)));
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

    /* if (this.deathCamera) {
      this.cameraRotation.z += 0.005;
    } */
  }

  public get location (): Location {
    this.object.getWorldPosition(this.currentPosition);
    this.object.getWorldDirection(this.currentRotation);

    return {
      position: this.currentPosition,
      rotation: MathUtils.radToDeg(
        Math.atan2(
          -this.currentRotation.x,
          this.currentRotation.z
        )
      )
    };
  }

  /* public get aimMode (): boolean {
    return this.aiming;
  } */

  public get uuid (): string {
    return this.object.uuid;
  }
}
