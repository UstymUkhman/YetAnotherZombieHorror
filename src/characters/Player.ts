import type { PlayerAnimations, CharacterAnimation, PlayerLocation, PlayerMovement } from '@/characters/types';
import type { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
import type { AnimationAction } from 'three/src/animation/AnimationAction';
import type { SkinnedMesh } from 'three/src/objects/SkinnedMesh';

import type { Texture } from 'three/src/textures/Texture';
import type { Object3D } from 'three/src/core/Object3D';
import { Quaternion } from 'three/src/math/Quaternion';
import { radToDeg } from 'three/src/math/MathUtils';
import type { Bone } from 'three/src/objects/Bone';

import { GameEvents } from '@/events/GameEvents';
import { Vector2 } from 'three/src/math/Vector2';
import { LoopOnce } from 'three/src/constants';
import Character from '@/characters/Character';

import type { Directions } from '@/controls';
import type Pistol from '@/weapons/Pistol';
import type Rifle from '@/weapons/Rifle';

import { Vector } from '@/utils/Vector';
import { Direction } from '@/controls';
import Camera from '@/managers/Camera';

import Configs from '@/configs';
import anime from 'animejs';

export default class Player extends Character
{
  private readonly modelRotation = new Quaternion();
  private readonly levelPosition = new Vector2();

  private currentAnimation!: AnimationAction;
  private lastAnimation = 'pistolIdle';
  private animationUpdate = false;

  private reloadTimeout!: NodeJS.Timeout;
  private animTimeout!: NodeJS.Timeout;
  private aimTimeout!: NodeJS.Timeout;
  private weapon!: Pistol | Rifle;

  private equipRifle = false;
  private hasRifle = false;

  private reloading = false;
  private shooting = false;
  private aiming = false;

  private hand?: Object3D;
  private pistol?: Pistol;
  private rifle!: Rifle;

  private shootTime = 0.0;
  private idleTime = 0.0;
  private moveTime = 0.0;
  private aimTime = 0.0;

  public constructor () {
    super(Configs.Player);
  }

  public async loadCharacter (envMap: Texture): Promise<void> {
    const character = await this.load(envMap);

    this.hand = character.scene.getObjectByName('swatRightHand');
    this.meshes.forEach(child => child.updateMorphTargets());

    GameEvents.dispatch('Level::AddObject', this.object);
    this.currentAnimation = this.animations.pistolIdle;

    this.animations.rifleReload.clampWhenFinished = true;
    this.animations.rifleAim.clampWhenFinished = true;
    this.animations.death.clampWhenFinished = true;

    this.animations.rifleReload.setLoop(LoopOnce, 1);
    this.animations.rifleAim.setLoop(LoopOnce, 1);
    this.animations.death.setLoop(LoopOnce, 1);

    Camera.setTo(character.scene);
    this.currentAnimation.play();
  }

  private getMovementAnimation (directions: Directions): PlayerAnimations {
    let direction = directions[Direction.UP]
      ? 'Forward' : directions[Direction.DOWN]
      ? 'Backward' : '';

    if (!this.equipRifle && !direction)
      direction = directions[Direction.LEFT]
        ? 'Left' : directions[Direction.RIGHT]
        ? 'Right' : direction;

    else if (this.equipRifle)
      direction += directions[Direction.LEFT]
        ? 'Left' : directions[Direction.RIGHT]
        ? 'Right' : '';

    return direction as PlayerAnimations || 'Idle';
  }

  private getWeaponAnimation (movement: string): string {
    return `${this.equipRifle ? 'rifle' : 'pistol'}${movement}`;
  }

  private getPlayerAnimation (): PlayerAnimations {
    const weapon = this.equipRifle ? 'rifle' : 'pistol';
    return this.lastAnimation.replace(weapon, '') as PlayerAnimations;
  }

  private blockingAnimation (): boolean {
    return this.aiming || this.hitting || this.reloading || this.animationUpdate;
  }

  public rotate (x: number, y: number, maxTilt = 0.25): void {
    const lookDown = y > 0;
    const fps = +Camera.isFPS;
    const tilt = this.rotation.y;
    const model = this.getModel();

    model.rotateOnWorldAxis(Vector.UP, x);
    if (this.running) return;

    const minTilt = fps * -0.2 - 0.2;
    maxTilt = Math.min(maxTilt + fps * maxTilt, 0.25);

    if ((lookDown && tilt >= minTilt) || (!lookDown && tilt <= maxTilt)) {
      model.rotateOnAxis(Vector.RIGHT, y);
    }
  }

  public idle (): void {
    const now = Date.now();
    const idleDelay = Math.max(350 - (now - this.idleTime), 0);

    if (this.blockingAnimation() || idleDelay)
      return setTimeout(this.idle.bind(this), idleDelay) as unknown as void;

    GameEvents.dispatch('Player::Aim', !this.equipRifle, true);
    GameEvents.dispatch('Player::Run', false, true);

    const idle = this.getWeaponAnimation('Idle');
    if (this.lastAnimation === idle) return;

    this.hasRifle && this.rifle.updatePosition(0);
    this.running = this.moving = false;
    Camera.runAnimation(false);
    this.idleTime = now;

    setTimeout(
      this.updateAnimation.bind(this, 'Idle', idle),
      +(this.lastAnimation === idle) * 100
    );
  }

  public move (directions: Directions, now = Date.now()): void {
    if (this.blockingAnimation()) return;
    if (now - this.moveTime < 350) return;

    const direction = this.getMovementAnimation(directions);
    const animation = this.getWeaponAnimation(direction);

    if (this.lastAnimation === animation) return;
    this.updateAnimation(direction, animation);

    GameEvents.dispatch('Player::Run', false, true);
    GameEvents.dispatch('Player::Aim', false, true);

    this.moving = direction !== 'Idle';
    this.moving && Camera.runAnimation(false);
    this.hasRifle && this.rifle.updatePosition(1);

    this.running = false;
    this.moveTime = now;
  }

  public run (directions: Directions, running: boolean): void {
    if (this.running === running) return;
    if (this.blockingAnimation()) return;

    const run = this.getWeaponAnimation('Run');

    if (!running || this.lastAnimation === run) {
      this.running = false;

      return !(directions as unknown as Array<number>).includes(1)
        ? setTimeout(this.idle.bind(this), 150) as unknown as void
        : this.move(directions);
    }

    if (directions[Direction.UP]) {
      this.hasRifle && this.rifle.updatePosition(1.5);
      GameEvents.dispatch('Player::Run', true, true);

      this.running = this.moving = true;
      this.updateAnimation('Run', run);

      Camera.runAnimation(true);
      this.resetRotation(true);
    }
  }

  public startAiming (animation: boolean): void {
    if (this.blockingAnimation()) return;
    this.weapon.aiming = this.aiming = true;
    GameEvents.dispatch('Player::Run', false, true);

    Camera.runAnimation(false);
    Camera.aimAnimation(true, this.equipRifle);
    Camera.updateNearPlane(true, this.equipRifle);
    setTimeout(this.toggleMesh.bind(this, true), 300);

    this.aimTime = this.equipRifle ? Date.now() : 0.0;
    const next = this.equipRifle ? 'rifleAim' : 'pistolIdle';

    this.weapon.setAim();

    if (this.lastAnimation !== next) {
      if (this.equipRifle || animation) {
        this.animTimeout = this.updateAnimation('Idle', next);
      }

      this.running = this.moving = false;
    }

    this.aimTimeout = setTimeout(() =>
      GameEvents.dispatch('Player::Aim', !Camera.isFPS, true)
    , 300 + +this.equipRifle * 300);

    !this.equipRifle && setTimeout(() => {
      this.currentAnimation.paused = true;
      this.setMixerTime(0.5);
    }, 400);
  }

  public stopAiming (running: boolean): void {
    this.equipRifle && clearTimeout(this.aimTimeout);
    const duration = Math.min(Date.now() - this.aimTime, 400);

    GameEvents.dispatch('Player::Aim', !this.equipRifle, true);
    !running && Camera.aimAnimation(false, this.equipRifle, duration);

    Camera.isFPS && running
      ? Camera.setNearPlane(this.equipRifle ? 0.5 : 0.315, 0)
      : Camera.updateNearPlane(false, this.equipRifle);

    this.weapon.aiming = this.aiming = false;
    this.currentAnimation.paused = false;

    this.weapon.cancelAim(duration);
    clearTimeout(this.animTimeout);
    this.toggleMesh(false);
  }

  public startShooting (now = Date.now()): void {
    if (this.equipRifle && !this.aiming) return;
    if (this.moving || this.hitting || this.reloading) return;
    if (now - this.aimTime < 500 || now - this.shootTime < 150) return;

    this.shooting = true;
    this.shootTime = now;

    const recoil = this.weapon.shoot();
    recoil && this.rotate(recoil.x, recoil.y);
    !this.equipRifle && this.stopShooting();
  }

  public stopShooting (): void {
    this.shooting = false;
  }

  public reload (getMovement: () => PlayerMovement): void {
    if (this.blockingAnimation()) return;
    if (this.weapon.full || !this.weapon.inStock) return;

    GameEvents.dispatch('Player::Run', false, true);
    this.updateAnimation('Idle', 'rifleReload');

    const near = +this.running * 0.02 + 0.13;
    this.running = this.moving = false;

    Camera.setNearPlane(near, 400);
    this.weapon.startReloading();
    Camera.runAnimation(false);

    this.reloading = true;
    this.toggleMesh(true);

    this.reloadTimeout = setTimeout(
      this.weapon.addAmmo.bind(this.weapon, 0)
    , 2000);

    setTimeout(() => {
      if (this.dead) return;
      this.toggleMesh(false);
      this.reloading = false;
      Camera.setNearPlane(0.5, 100);

      const { directions, running } = getMovement();
      running ? this.run(directions, running) : this.move(directions);
    }, 2500);
  }

  private updateAnimation (animation: CharacterAnimation, action: string, duration = 0.1): NodeJS.Timeout {
    this.currentAnimation.crossFadeTo(this.animations[action], duration, true);
    this.animations[action].play();
    this.animationUpdate = true;

    return setTimeout(() => {
      this.lastAnimation = action;
      this.setAnimation(animation);

      this.currentAnimation.stop();
      this.animationUpdate = false;

      this.currentAnimation = this.animations[action];
    }, duration * 1e3);
  }

  public setPistol (targets: Array<Object3D>, pistol?: Pistol): void {
    this.setWeapon(false);

    if (pistol) {
      this.pistol = pistol;
      this.weapon = this.pistol;
      this.pistol.targets = targets;
      this.hand?.add(this.pistol.object);
    }

    else {
      this.weapon = (this.pistol as Pistol);
      this.updateRiflePosition(true);
      this.weapon.targets = targets;
      this.weapon.visible = true;
      this.rifle.toggle = false;
    }
  }

  private setRifle (targets: Array<Object3D>): void {
    this.rifle.targets = targets;
    this.weapon.visible = false;
    this.rifle.toggle = true;
    this.weapon = this.rifle;
    this.setWeapon(true);
  }

  private setWeapon (rifle: boolean): void {
    GameEvents.dispatch('Weapon::Change', rifle);

    let animation = rifle ?
      this.lastAnimation.replace('pistol', 'rifle') :
      this.lastAnimation.replace('rifle', 'pistol');

    if (!rifle && !this.animations[animation]) {
      animation = animation.replace(/BackwardLeft|BackwardRight/gm, 'Backward');
      animation = animation.replace(/ForwardLeft|ForwardRight/gm, 'Forward');
    }

    this.lastAnimation !== animation && this.updateAnimation(
      this.getPlayerAnimation(), animation
    );

    this.hasRifle = this.equipRifle || rifle;
    this.equipRifle = rifle;
  }

  public changeCamera (view: boolean): void {
    if (!view) Camera.changeShoulder(this.aiming, this.equipRifle);

    else {
      const aiming = this.equipRifle && !this.aiming || !Camera.isFPS && this.aiming;
      Camera.changeView(this.running, this.aiming, this.equipRifle);

      !Camera.isFPS && this.resetRotation();
      this.toggleVisibility();

      setTimeout(() => {
        const aim = !this.moving && !aiming;
        GameEvents.dispatch('Player::Aim', aim, true);
      }, +aiming * 300);
    }
  }

  private resetRotation (run = false): void {
    if (run) {
      const model = this.getModel();
      const targetRotation = new Quaternion()
        .setFromAxisAngle(Vector.RIGHT, this.rotation.y);

      this.modelRotation.copy(model.quaternion);
      this.modelRotation.multiply(targetRotation);

      anime({
        targets: model.quaternion,
        easing: 'easeInOutQuad',
        ...this.modelRotation,
        duration: 500
      });
    }

    else if (this.rotation.y < -0.2) {
      const y = this.rotation.y + 0.2;
      this.getModel().rotateOnAxis(Vector.RIGHT, y);
    }
  }

  private toggleMesh (show: boolean): void {
    Camera.isFPS && this.equipRifle && this.meshes.forEach(child =>
      (child.material as MeshStandardMaterial).opacity = +show
    );
  }

  private toggleVisibility (): void {
    const hideDelay = +Camera.isFPS * 250;
    const showDelay = +Camera.isFPS * 150 + 250;

    this.weapon.toggleVisibility(hideDelay, showDelay);
    const fadeIn = !(Camera.isFPS && this.equipRifle && !this.aiming);

    this.meshes.forEach(child => {
      anime({
        targets: child.material,
        delay: hideDelay,
        easing: 'linear',
        duration: 100,
        opacity: 0.0
      });

      fadeIn && setTimeout(() => anime({
        targets: child.material,
        easing: 'linear',
        duration: 100,
        opacity: 1.0
      }), showDelay);
    });
  }

  public changeWeapon (): void {
    if (!this.hasRifle || this.blockingAnimation()) return;
    const aim = !this.moving && this.equipRifle;

    GameEvents.dispatch('Player::Aim', aim, true);
    const targets = this.weapon.targets;
    this.toggleMesh(true);

    !this.equipRifle ? this.setRifle(targets) : this.setPistol(targets);
    Camera.updateNearPlane(this.aiming, this.equipRifle, this.running);
  }

  public addRifle (rifle: Rifle): void {
    this.rifle = rifle;
    this.rifle.toggle = false;
    this.rifle.dummy.visible = false;

    this.hand?.add(this.rifle.object);
    this.spine.add(this.rifle.dummy);
    this.updateRiflePosition(true);
  }

  public pickRifle (): void {
    this.rifle.dummy.visible = !this.equipRifle;
    this.updateRiflePosition();
    this.hasRifle = true;
    this.rifle.addAmmo();
  }

  private updateRiflePosition (append = false): void {
    const factor = +this.running * 0.5 + +this.moving;

    append
      ? this.rifle.append(factor)
      : this.rifle.updatePosition(factor);
  }

  public override update (delta: number): void {
    super.update(delta);
    this.shooting && this.startShooting();
  }

  public override dispose (): void {
    clearTimeout(this.reloadTimeout);
    clearTimeout(this.animTimeout);
    clearTimeout(this.aimTimeout);

    this.pistol?.dispose();
    this.weapon.dispose();
    this.rifle.dispose();

    delete this.pistol;
    delete this.hand;

    super.dispose();
  }

  public die (): void {
    this.updateAnimation('Idle', 'death', 0.5);
    GameEvents.dispatch('Player::Death');
    clearTimeout(this.reloadTimeout);

    this.weapon.stopReloading();
    this.setAnimation('Idle');
    Camera.deathAnimation();

    this.reloading = false;
    this.shooting = false;
    this.aiming = false;

    this.death(true);
  }

  private get meshes (): Array<SkinnedMesh> {
    return this.getModel().children[0].children[1].children as Array<SkinnedMesh>;
  }

  private get spine (): Bone {
    return this.getModel().children[0].children[0].children[0] as Bone;
  }

  public get location (): PlayerLocation {
    return {
      position: this.position,
      rotation: radToDeg(
        Math.atan2(-this.rotation.x, this.rotation.z)
      )
    };
  }

  public get coords (): Vector2 {
    const { x, z } = this.position;
    return this.levelPosition.set(x, z);
  }

  public get uuid (): string {
    return this.object.uuid;
  }
}
