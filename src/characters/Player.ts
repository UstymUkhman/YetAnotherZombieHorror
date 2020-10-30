type AnimationAction = import('@three/animation/AnimationAction').AnimationAction;
type Object3D = import('@three/core/Object3D').Object3D;
type Vector2 = import('@three/math/Vector2').Vector2;

import { Direction, Directions } from '@/managers/Input';
import { GameEvents } from '@/managers/GameEvents';
import { MathUtils } from '@three/math/MathUtils';
import { Camera } from '@/managers/GameCamera';

import Character from '@/characters/Character';
import { Vector3 } from '@three/math/Vector3';

import { clamp } from '@/utils/Number';
import { Settings } from '@/settings';

import Pistol from '@/weapons/Pistol';
// import Rifle from '@/weapons/Rifle';
type Weapon = Pistol /* | Rifle */;

export type Location = {
  position: Vector3
  rotation: number
};

export class Player extends Character {
  private readonly currentPosition = new Vector3();
  private readonly currentRotation = new Vector3();

  private currentAnimation!: AnimationAction;
  private lastAnimation = 'pistolIdle';

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

  private weapon!: Weapon;
  private hand?: Object3D;

  public constructor () {
    super(Settings.Player);

    if (!Settings.freeCamera) {
      Camera.setTo(this.object);
    }
  }

  private getMovementAnimation (directions: Directions): Settings.Animation {
    let direction = directions[Direction.UP] ? 'Forward' : directions[Direction.DOWN] ? 'Backward' : '';

    if (!this.equipRifle && !direction) {
      direction = directions[Direction.LEFT] ? 'Left' : directions[Direction.RIGHT] ? 'Right' : direction;
    } else if (this.equipRifle) {
      direction += directions[Direction.LEFT] ? 'Left' : directions[Direction.RIGHT] ? 'Right' : '';
    }

    return direction as Settings.Animation || 'Idle';
  }

  private getWeaponAnimation (movement: string): string {
    return `${this.equipRifle ? 'rifle' : 'pistol'}${movement}`;
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

    GameEvents.dispatch('run', running);
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

  public setPistol (pistol: Pistol): void {
    // this.weapon.targets = colliders;
    this.hand?.add(pistol.model);
    this.weapon = pistol;
  }

  public changeWeapon (): void {
    if (!this.hasRifle || this.aiming || this.reloading) return;
    // const weapon = this.equipRifle ? this.pistol : this.ak47;
    // const colliders = this.weapon.targets;

    // weapon.setToPlayer(false);
    // this.setWeapon(colliders, weapon, !this.equipRifle);
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
