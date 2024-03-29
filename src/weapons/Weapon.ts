import type { WeaponConfig, FireConfig, WeaponSound, SoundOptions, Recoil } from '@/weapons/types';
import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
import type { ShaderMaterial } from 'three/src/materials/ShaderMaterial';

import type { Intersection } from 'three/src/core/Raycaster';
import type { Texture } from 'three/src/textures/Texture';
import type { Object3D } from 'three/src/core/Object3D';
import type { Group } from 'three/src/objects/Group';
import { Raycaster } from 'three/src/core/Raycaster';

import type { Mesh } from 'three/src/objects/Mesh';
import type { Euler } from 'three/src/math/Euler';
import { CameraObject } from '@/managers/Camera';
import { GameEvents } from '@/events/GameEvents';
import { Vector3 } from 'three/src/math/Vector3';

import { FrontSide } from 'three/src/constants';
import { Assets } from '@/loaders/AssetsLoader';
import { Direction } from '@/utils/Direction';
import { random } from '@/utils/Number';
import { Colors } from '@/utils/Color';
import Bullet from '@/weapons/Bullet';

import Settings from '@/settings';
import Fire from '@/weapons/Fire';
import Hole from '@/weapons/Hole';
import RAF from '@/managers/RAF';
import anime from 'animejs';

export default abstract class Weapon
{
  private readonly onUpdate = this.updateAimSign.bind(this);
  private readonly onShoot = this.updateBullets.bind(this);

  private readonly bullets: Map<string, Mesh> = new Map();
  private readonly hits: Array<Intersection<Mesh>> = [];
  private readonly raycaster = new Raycaster();

  private readonly camera = new Vector3();
  private readonly offset = new Vector3();
  private readonly origin = new Vector3();

  public targets: Array<Object3D> = [];
  protected readonly magazine: number;
  public walls: Array<Object3D> = [];
  private readonly bullet?: Bullet;

  protected loadedAmmo: number;
  protected totalAmmo: number;
  // private bulletSpeed = 0.0;
  private weapon!: Group;

  private aimed = false;
  public aiming = false;

  private fire!: Fire;
  private hole?: Hole;

  public constructor (private readonly config: WeaponConfig) {
    if (Settings.getVisualValue('bullet')) {
      this.bullet = new Bullet(config.bullet);
      // this.bulletSpeed = this.bullet.speed;
    }

    this.magazine = config.magazine;
    this.loadedAmmo = config.ammo;
    this.totalAmmo = config.ammo;
  }

  protected async load (envMap: Texture): Promise<Group> {
    const { emissive = Colors.BLACK, emissiveIntensity = 1.0 } = this.config;
    this.weapon = (await Assets.Loader.loadGLTF(this.config.model)).scene;

    this.weapon.traverse(child => {
      const childMesh = child as Mesh;
      const material = childMesh.material as MeshStandardMaterial;

      if (childMesh.isMesh) {
        childMesh.castShadow = childMesh.receiveShadow = true;

        childMesh.material = new MeshStandardMaterial({
          emissiveIntensity,
          transparent: true,
          map: material.map,
          side: FrontSide,

          roughness: 0.75,
          metalness: 0.25,
          emissive,
          envMap
        });
      }
    });

    this.weapon.position.copy(this.config.position as Vector3);
    this.weapon.rotation.copy(this.config.rotation as Euler);
    this.weapon.scale.copy(this.config.scale as Vector3);

    const clone = this.weapon.clone();

    this.fire = new Fire(
      this.config.fire as FireConfig,
      this.weapon, this.config.textures
    );

    if (Settings.getVisualValue('bulletHoles')) {
      this.hole = new Hole(
        this.config.textures,
        this.config.bullet.scale
      );
    }

    return clone;
  }

  protected playSound (sfx: WeaponSound, options: SoundOptions): void {
    const { stop, pistol, delay } = options;
    stop && this.stopSound(sfx, pistol);

    GameEvents.dispatch('SFX::Weapon', {
      matrix: this.weapon.matrixWorld,
      play: true, sfx, delay, pistol
    }, true);
  }

  protected stopSound (sfx: WeaponSound, pistol?: boolean): void {
    GameEvents.dispatch('SFX::Weapon', {
      matrix: this.weapon.matrixWorld,
      play: false, sfx, pistol
    }, true);
  }

  private updateRaycaster (spread = true, targets = this.targets): void {
    this.camera.setFromMatrixPosition(CameraObject.matrixWorld);

    this.raycaster.ray.origin.copy(
      spread ? this.camera.clone().add(this.spread) : this.camera
    );

    this.raycaster.ray.direction.copy(Direction.FORWARD)
      .unproject(CameraObject)
      .sub(this.camera)
      .normalize();

    this.hits.splice(0) &&
      this.raycaster.intersectObjects(targets, false, this.hits);
  }

  protected abstract toggleVisibility (hide: number, show: number, duration?: number): void;

  public abstract cancelAim (duration?: number): void;

  public abstract getDamage (index: number): number;

  private toggleAimSign (visible = false): void {
    GameEvents.dispatch('Weapon::Aim', visible, true);
    this.aimed = visible;
  }

  private removeBullet (uuid: string): void {
    const bullet = this.bullets.get(uuid);
    if (!bullet) return;

    bullet.clear();
    this.bullets.delete(uuid);
    GameEvents.dispatch('Level::RemoveObject', bullet);
  }

  private getEvent (index: number): string {
    return !index ? 'Hit::Head' : index === 1 ? 'Hit::Body' : 'Hit::Leg';
  }

  private updateAimSign (): boolean | void {
    if (!this.aiming) return this.aimed && this.toggleAimSign(false);

    this.updateRaycaster(false);
    const aimed = !!this.hits.length;
    this.aimed !== aimed && this.toggleAimSign(aimed);
  }

  public startReloading (): void { return; }

  public stopReloading (): void { return; }

  public resize (height: number): void {
    this.fire?.resize(height);
  }

  public addAmmo (): void { return; }

  private animateRecoil (): Recoil {
    const { x, y } = this.weapon.position;
    const recoil = this.recoil;

    anime({
      targets: this.weapon.rotation,
      easing: 'easeInOutSine',
      direction: 'alternate',
      z: recoil.y / 5.0,
      duration: 50.0
    });

    anime({
      targets: this.weapon.position,
      easing: 'easeInOutSine',
      direction: 'alternate',
      y: y - recoil.y * 7.5,
      x: x - recoil.y * 15,
      duration: 50.0
    });

    return recoil;
  }

  private updateBullets (): void {
    !this.fire.update() && RAF.remove(this.onShoot);

    this.bullets.forEach((bullet, uuid) => {
      if (Date.now() < bullet.userData.lifeTime)
        (this.bullet as Bullet).update(bullet);

      else this.removeBullet(uuid);
    });
  }

  public shoot (): Recoil | void {
    if (this.empty) return this.playSound(
      'empty', { stop: false }
    );

    const target = this.target;
    const hitBox = this.targets[target];
    const recoil = this.animateRecoil();

    let bullet: Mesh | undefined = undefined;
    !this.bullets.size && RAF.add(this.onShoot);
    GameEvents.dispatch('Player::Shoot', true, true);

    if (this.bullet) {
      const { ray } = this.raycaster;
      bullet = this.bullet.shoot(ray, this.aiming);
      this.bullets.set(bullet.uuid, bullet);
    }

    this.fire.addParticles();
    this.loadedAmmo--;
    this.totalAmmo--;

    this.playSound('shoot', { stop: true });
    this.playSound('bullet', { stop: false, delay: 0.5 });

    if (target < 0) {
      this.updateRaycaster(false, this.walls);
      this.hits.length && this.hole?.show(this.hits[0]);
      return recoil;
    }

    const index = target % 6;
    const event = this.getEvent(index);

    // const distance = bullet ? hitBox.position.distanceToSquared(bullet.position) : 0.0;
    const headshot = !index && Math.random() < this.config.headshot;
    const damage = headshot && 100.0 || this.getDamage(index);

    // setTimeout(() => {
    bullet && this.removeBullet(bullet.uuid);
    const { enemy } = hitBox.userData;

    GameEvents.dispatch(event, {
      enemy, damage, headshot
    });
    // }, distance * this.bulletSpeed);

    return recoil;
  }

  public abstract setAim (): void;

  protected dispose (): void {
    this.bullets.forEach((bullet, uuid) => {
      const path = bullet.children[0] as Mesh;
      const bulletMaterial = bullet.material as MeshStandardMaterial;

      (path.material as ShaderMaterial).dispose();
      bulletMaterial.map?.dispose();
      bullet.geometry.dispose();

      bulletMaterial.dispose();
      path.geometry.dispose();
      this.removeBullet(uuid);
    });

    RAF.remove(this.onUpdate);
    RAF.remove(this.onShoot);

    this.bullet?.dispose();
    this.targets.splice(0);
    this.walls.splice(0);

    this.hole?.dispose();
    this.weapon.clear();
    this.fire.dispose();
  }

  public set visible (visible: boolean) {
    RAF[visible ? 'add' : 'remove'](this.onUpdate);
    this.weapon.children[0].visible = visible;
  }

  private get originOffset (): number {
    const { x, y } = this.config.bullet.position;
    return this.aiming ? y : x;
  }

  private get spread (): Vector3 {
    let { x, y } = this.config.spread;
    const spread = +!this.aiming * 0.5 + 0.5;

    x = random(-x, x) * spread;
    y = random(-y, y) * spread;

    return this.offset.set(x, y - 0.003, 0.0);
  }

  private get recoil (): Recoil {
    const { x, y } = this.config.recoil;
    const energy = +!this.aiming * 0.5 + 0.5;

    return {
      x: random(-x, x) * energy,
      y: y * energy
    };
  }

  private get target (): number {
    this.updateRaycaster();
    this.weapon.getWorldPosition(this.origin);

    this.origin.y += this.originOffset;
    this.raycaster.ray.origin.copy(this.origin);

    return this.hits.length ? this.targets.indexOf(this.hits[0].object) : -1;
  }

  public get inStock (): number {
    return this.totalAmmo - this.loadedAmmo;
  }

  public get empty (): boolean {
    return !this.loadedAmmo;
  }

  public get full (): boolean {
    return this.loadedAmmo === this.magazine;
  }

  public get object (): Group {
    return this.weapon as Group;
  }
}
