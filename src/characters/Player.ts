import type { PlayerAnimations, PlayerHitAnimation, HitDirection } from '@/characters/types';
import type { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
import type { SkinnedMesh } from 'three/src/objects/SkinnedMesh';

import type { Texture } from 'three/src/textures/Texture';
import type { PlayerLocation } from '@/characters/types';
import type { Object3D } from 'three/src/core/Object3D';
import { Quaternion } from 'three/src/math/Quaternion';
import { radToDeg } from 'three/src/math/MathUtils';
import type { Bone } from 'three/src/objects/Bone';

import { GameEvents } from '@/events/GameEvents';
import { Vector2 } from 'three/src/math/Vector2';
import { LoopOnce } from 'three/src/constants';
import Character from '@/characters/Character';

import { Weapon } from '@/weapons/types.d';
import type Pistol from '@/weapons/Pistol';
import type Rifle from '@/weapons/Rifle';
import { Vector } from '@/utils/Vector';
import { Direction } from '@/controls';
import Camera from '@/managers/Camera';

import Controls from '@/controls';
import Configs from '@/configs';
import anime from 'animejs';

export default class Player extends Character
{
  private readonly modelRotation = new Quaternion();
  protected override lastAnimation = 'pistolIdle';
  private readonly levelPosition = new Vector2();

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
  private aimTime = 0.0;

  public constructor () {
    super(Configs.Player);
  }

  public async loadCharacter (envMap: Texture): Promise<void> {
    const character = await this.load(envMap);

    this.hand = character.scene.getObjectByName('swatRightHand');
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
    this.rotate(-Math.PI, 0.0);
  }

  public rotate (x: number, y: number, maxTilt = 0.25): void {
    const lookDown = y > 0;
    const model = this.mesh;
    const fps = +Camera.isFPS;
    const tilt = this.rotation.y;

    model.rotateOnWorldAxis(Vector.UP, x);
    if (this.running) return;

    const minTilt = fps * -0.2 - 0.2;
    maxTilt = Math.min(maxTilt + fps * maxTilt, 0.25);

    if ((lookDown && tilt >= minTilt) || (!lookDown && tilt <= maxTilt)) {
      model.rotateOnAxis(Vector.RIGHT, y);
    }
  }

  public idle (): NodeJS.Timeout | void {
    const now = Date.now();
    const idleDelay = Math.max(350 - (now - this.idleTime), 0);

    if (this.blockingAnimation || idleDelay)
      return setTimeout(this.idle.bind(this), idleDelay);

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

  public move (): void {
    if (this.blockingAnimation) {
      if (this.reloading)
        this.moving = Controls.movingDirection;
      return;
    }

    const direction = this.movementAnimation;
    const animation = this.getWeaponAnimation(direction);

    if (this.lastAnimation === animation) return;
    this.updateAnimation(direction, animation);

    this.running = false;
    this.moving = direction !== 'Idle';

    this.moving && Camera.runAnimation(false);
    this.hasRifle && this.rifle.updatePosition(1);

    GameEvents.dispatch('Player::Run', false, true);
    GameEvents.dispatch('Player::Aim', false, true);
  }

  public run (running: boolean): NodeJS.Timeout | void {
    if (this.blockingAnimation) return;
    if (this.running === running) return;

    const run = this.getWeaponAnimation('Run');

    if (!running || this.lastAnimation === run) {
      this.running = false;

      return Controls.movingDirection ? this.move()
        : setTimeout(this.idle.bind(this), 150);
    }

    if (Controls.moves[Direction.UP]) {
      this.hasRifle && this.rifle.updatePosition(1.5);
      GameEvents.dispatch('Player::Run', true, true);

      this.running = this.moving = true;
      this.updateAnimation('Run', run);

      Camera.runAnimation(true);
      this.resetRotation(true);
    }
  }

  public hit (direction: HitDirection, damage: number): void {
    if (this.dead || this.updateHealth(damage)) return;
    this.aiming && this.stopAiming(this.running);

    const duration = +!this.equipRifle * 100.0 + 1200.0;
    const hitAnimation = this.getHitAnimation(direction);

    this.updateAnimation('Idle', hitAnimation);
    Camera.isFPS && Camera.headAnimation(
      direction, duration * 0.5
    );

    clearTimeout(this.reloadTimeout);
    this.playSound('hit', true);
    this.weapon.stopReloading();

    setTimeout(() => {
      if (this.dead) return;
      this.hitting = false;

      Controls.runs
        ? this.run(true)
        : this.move();
    }, duration);

    this.reloading = false;
    this.running = false;
    this.hitting = true;
    this.moving = false;
  }

  public startAiming (animation: boolean): void {
    if (this.blockingAnimation) return;
    this.weapon.aiming = this.aiming = true;
    GameEvents.dispatch('Player::Run', false, true);

    Camera.runAnimation(false);
    Camera.aimAnimation(true, this.equipRifle);
    Camera.updateNearPlane(true, this.equipRifle);

    const next = this.equipRifle ? 'rifleAim' : 'pistolIdle';
    setTimeout(this.toggleMesh.bind(this, true), 300);
    this.aimTime = +this.equipRifle * Date.now();

    clearTimeout(this.animTimeout);
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
    if (this.reloading) return;
    this.equipRifle && clearTimeout(this.aimTimeout);
    const duration = Math.min(Date.now() - this.aimTime, 400);

    GameEvents.dispatch('Player::Aim', !this.equipRifle, true);
    !running && Camera.aimAnimation(false, this.equipRifle, duration);

    Camera.isFPS && running
      ? Camera.setNearPlane(+this.equipRifle * 0.185 + 0.315, 0)
      : Camera.updateNearPlane(false, this.equipRifle);

    setTimeout(() =>
      this.weapon.aiming = this.aiming = false
    , 100);

    this.weapon.aiming = this.aiming = false;
    this.currentAnimation.paused = false;

    this.weapon.cancelAim(duration);
    clearTimeout(this.animTimeout);
    this.toggleMesh(false);
  }

  public startShooting (now = Date.now()): void {
    if (this.equipRifle && !this.aiming) return;
    if (this.moving || this.hitting || this.reloading) return;
    if (now - this.aimTime < 500 || now - this.shootTime < 165) return;

    this.shooting = true;
    this.shootTime = now;

    const recoil = this.weapon.shoot();
    recoil && this.rotate(recoil.x, recoil.y);
    !this.equipRifle && this.stopShooting();
  }

  public stopShooting (): void {
    this.shooting = false;
  }

  public reload (): void {
    const moving = this.moving;
    if (this.blockingAnimation) return;
    if (this.weapon.full || !this.weapon.inStock) return;

    GameEvents.dispatch('Player::Run', false, true);
    this.updateAnimation('Idle', 'rifleReload');

    const near = +this.running * 0.02 + 0.13;
    this.running = this.moving = false;

    Camera.setNearPlane(near, 400.0);
    this.weapon.startReloading();
    Camera.runAnimation(false);

    this.reloading = true;
    this.toggleMesh(true);

    this.reloadTimeout = setTimeout(() => {
      const moved = !Controls.movingDirection;
      (moving || this.moving) && moved && this.weapon.stopReloading();

      this.weapon.addAmmo(0.0);
      this.reloading = false;
    }, 2000.0);

    this.animTimeout = setTimeout(() => {
      if (this.dead) return;
      this.toggleMesh(false);
      this.weapon.stopReloading();

      Camera.setNearPlane(0.5, 100.0);
      Controls.runs ? this.run(true) : this.move();
    }, 2500.0);
  }

  public setPistol (walls = this.weapon.walls, pistol?: Pistol): void {
    this.setWeapon(false);

    if (pistol) {
      this.pistol = pistol;
      this.weapon = this.pistol;
      this.weapon.walls = walls;

      this.weapon.visible = true;
      this.hand?.add(this.weapon.object);
    }

    else {
      const targets = this.weapon.targets;
      this.weapon = (this.pistol as Pistol);
      this.updateRiflePosition(true);

      this.weapon.visible = true;
      this.weapon.walls = walls;
      this.rifle.toggle = false;
      this.setTargets(targets);
    }
  }

  private setRifle (): void {
    this.rifle.walls = this.weapon.walls;
    const targets = this.weapon.targets;

    this.weapon.visible = false;
    this.rifle.toggle = true;
    this.weapon = this.rifle;

    this.setTargets(targets);
    this.setWeapon(true);
  }

  private setWeapon (rifle: boolean): void {
    GameEvents.dispatch('Weapon::Change', rifle);

    let animation = rifle ?
      this.lastAnimation.replace(Weapon.Pistol, Weapon.Rifle) :
      this.lastAnimation.replace(Weapon.Rifle, Weapon.Pistol);

    if (!rifle && !this.animations[animation]) {
      animation = animation.replace(/BackwardLeft|BackwardRight/gm, 'Backward');
      animation = animation.replace(/ForwardLeft|ForwardRight/gm, 'Forward');
    }

    this.lastAnimation !== animation && this.updateAnimation(
      this.playerAnimation, animation
    );

    this.hasRifle = this.equipRifle || rifle;
    this.equipRifle = rifle;
  }

  public setTargets (targets: Array<Object3D>): void {
    this.weapon.targets = targets;
  }

  public changeCamera (view: boolean): void {
    if (!view) Camera.changeShoulder(this.aiming, this.equipRifle);

    else if (!this.hitting) {
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
      const model = this.mesh;
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
      this.mesh.rotateOnAxis(Vector.RIGHT, y);
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
    if (!this.hasRifle || this.blockingAnimation) return;
    const aim = !this.moving && this.equipRifle;

    GameEvents.dispatch('Player::Aim', aim, true);
    this.toggleMesh(true);

    this.equipRifle ? this.setPistol() : this.setRifle();
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

  protected override updateAnimation (
    animation: PlayerAnimations,
    action: string,
    duration = 0.1
  ): NodeJS.Timeout {
    return super.updateAnimation(animation, action, duration);
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

  protected override die (): void {
    super.die();

    this.updateAnimation('Idle', 'death', 0.5);
    GameEvents.dispatch('Player::Death', true);
    Camera.isFPS && this.changeCamera(true);
    const delay = +Camera.isFPS * 500;

    // Dispatch from "Game Over" menu:
    setTimeout(() =>
      GameEvents.dispatch('Game::Quit')
    , delay + 1500);

    clearTimeout(this.reloadTimeout);
    Camera.deathAnimation(delay);
    this.weapon.stopReloading();

    this.reloading = false;
    this.shooting = false;
    this.aiming = false;
  }

  private getHitAnimation (direction: HitDirection): PlayerHitAnimation {
    return `${this.currentWeapon}${direction}Hit`;
  }

  private getWeaponAnimation (movement: string): string {
    return `${this.currentWeapon}${movement}`;
  }

  protected override get blockingAnimation (): boolean {
    return this.aiming || this.hitting || this.reloading || super.blockingAnimation;
  }

  private get movementAnimation (): PlayerAnimations {
    const directions = Controls.moves;

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

  private get playerAnimation (): PlayerAnimations {
    return this.lastAnimation.replace(this.currentWeapon, '') as PlayerAnimations;
  }

  private get meshes (): Array<SkinnedMesh> {
    return this.mesh.children[0].children[1].children as Array<SkinnedMesh>;
  }

  public get location (): PlayerLocation {
    return {
      position: this.position,
      rotation: radToDeg(
        Math.atan2(-this.rotation.x, this.rotation.z)
      )
    };
  }

  private get currentWeapon (): Weapon {
    return this.equipRifle ? Weapon.Rifle : Weapon.Pistol;
  }

  public get coords (): Vector2 {
    const { x, z } = this.position;
    return this.levelPosition.set(x, z);
  }

  private get spine (): Bone {
    return this.mesh.children[0].children[0].children[0] as Bone;
  }
}
