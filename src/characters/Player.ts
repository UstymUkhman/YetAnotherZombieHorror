type AnimationAction = import('@three/animation/AnimationAction').AnimationAction;
import { Location, PlayerAnimations, CharacterAnimation } from '@/types';
type Object3D = import('@three/core/Object3D').Object3D;

import { Direction, Directions } from '@/managers/Input';
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

  private shootTime = 0;
  private moveTime = 0;
  private idleTime = 0;
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

    this.hasRifle = this.equipRifle || rifle;
    this.updateAnimation('Idle', animation);
    this.equipRifle = rifle;
  }

  public rotate (x: number, y: number, maxTilt: number): void {
    const lookDown = y > 0;
    const tilt = this.rotation.y;
    const model = this.getModel();

    model.rotateOnWorldAxis(AXIS_Y, x);

    if ((lookDown && tilt >= -0.2) || (!lookDown && tilt <= maxTilt)) {
      model.rotateOnAxis(AXIS_X, y);
    }
  }

  public idle (): void {
    const now = Date.now();

    if (now - this.idleTime < 350) return;
    if (this.aiming || this.hitting) return;
    const idle = this.getWeaponAnimation('Idle');

    GameEvents.dispatch('player:run', false);
    Camera.runAnimation(() => false, false);

    this.running = this.moving = false;
    this.idleTime = now;

    setTimeout(
      this.updateAnimation.bind(this, 'Idle', idle),
      ~~(this.lastAnimation === idle) * 100
    );
  }

  public move (directions: Directions, running: boolean): void {
    const now = Date.now();

    if (now - this.moveTime < 350) return;
    if (this.aiming || this.hitting) return;

    if (this.running && running && directions[Direction.UP]) {
      return this.run(directions, true);
    }

    const direction = this.getMovementAnimation(directions);
    const animation = this.getWeaponAnimation(direction);

    if (this.lastAnimation === animation) return;

    this.updateAnimation(direction, animation);
    GameEvents.dispatch('player:run', false);
    Camera.runAnimation(() => false, false);

    // clearTimeout(this.reloadTimeout);
    // this.weapon.cancelReload();

    this.reloading = false;
    this.running = false;
    this.moveTime = now;
    this.moving = true;
  }

  public run (directions: Directions, running: boolean): void {
    if (this.running === running) return;
    if (this.aiming || this.hitting) return;

    const run = this.getWeaponAnimation('Run');
    // clearTimeout(this.reloadTimeout);
    // this.weapon.cancelReload();

    if (!running || this.lastAnimation === run) {
      this.running = this.reloading = false;

      !(directions as unknown as Array<number>).includes(1)
        ? setTimeout(this.idle.bind(this), 150)
        : this.move(directions, false);

      return;
    }

    if (directions[Direction.UP]) {
      Camera.runAnimation(() => this.running, true);
      GameEvents.dispatch('player:run', true);
      this.updateAnimation('Run', run);

      this.reloading = false;
      this.running = true;
      this.moving = true;
    }
  }

  public startAiming (): void {
    if (this.hitting) return;

    GameEvents.dispatch('player:run', false);
    this.weapon.aim = this.aiming = true;

    Camera.runAnimation(() => false, false);
    Camera.aimAnimation(this.running, true, 400);

    this.aimTime = this.equipRifle ? Date.now() : 0;
    const next = this.equipRifle ? 'rifleAim' : this.getWeaponAnimation('Idle');

    if (this.lastAnimation !== next) {
      this.aimTimeout = this.updateAnimation('Idle', next);
      // clearTimeout(this.reloadTimeout);
      // this.weapon.cancelReload();
      this.weapon.setAim();

      this.reloading = false;
      this.running = false;
      this.moving = false;
    }
  }

  public stopAiming (): void {
    const elapse = Date.now() - this.aimTime;
    const duration = Math.min(elapse, 400);
    this.weapon.aim = this.aiming = false;

    Camera.aimAnimation(this.running, false, duration);
    elapse < 100 && this.currentAnimation.stop();
    clearTimeout(this.aimTimeout);
    this.weapon.cancelAim();
  }

  public startShooting (): void {
    this.shooting = true;
    const now = Date.now();

    if (now - this.aimTime < 500) return;
    if (now - this.shootTime < 150) return;
    if (this.running || this.hitting || this.reloading) return;

    if (this.weapon.shoot(this.position)) {
      const { x, y } = this.weapon.recoil;
      this.rotate(x, y, 0.2);
    }

    this.reloading = false;
    this.shootTime = now;
    this.running = false;
  }

  public stopShooting (): void {
    this.shooting = false;
  }

  public reload (): void {
    if (this.reloading || this.hitting || this.weapon.full || this.weapon.empty) return;

    this.updateAnimation('Idle', 'rifleReload');
    // this.reloading = true;
    this.weapon.reload();
  }

  private updateAnimation (animation: CharacterAnimation, action: string): number {
    this.currentAnimation.crossFadeTo(this.animations[action], 0.1, true);
    this.animations[action].play();

    return setTimeout(() => {
      this.setAnimation(animation);
      this.lastAnimation = action;

      this.currentAnimation.stop();
      this.currentAnimation = this.animations[action];
    }, 100) as unknown as number;
  }

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
    this.shooting && this.startShooting();
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
