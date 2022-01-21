import type { WeaponConfig, FireConfig, WeaponSound, Recoil } from '@/weapons/types';
import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
import type { ShaderMaterial } from 'three/src/materials/ShaderMaterial';

import type { Texture } from 'three/src/textures/Texture';
import type { Object3D } from 'three/src/core/Object3D';
import { Raycaster } from 'three/src/core/Raycaster';

import type { Mesh } from 'three/src/objects/Mesh';
import type { Euler } from 'three/src/math/Euler';
import { CameraObject } from '@/managers/Camera';
import { GameEvents } from '@/events/GameEvents';

import { Vector3 } from 'three/src/math/Vector3';
import { FrontSide } from 'three/src/constants';
import { Assets } from '@/loaders/AssetsLoader';

import { random } from '@/utils/Number';
import { Vector } from '@/utils/Vector';
import { Color } from '@/utils/Color';
import Bullet from '@/weapons/Bullet';

import Fire from '@/weapons/Fire';
import RAF from '@/managers/RAF';
import anime from 'animejs';

export default class Weapon
{
  private readonly onUpdate = this.updateBullets.bind(this);
  private readonly bullet = new Bullet(this.config.bullet);
  private readonly raycaster = new Raycaster();

  private readonly camera = new Vector3();
  private readonly origin = new Vector3();

  public targets: Array<Object3D> = [];
  protected readonly magazine: number;
  private bullets: Array<Mesh> = [];

  protected loadedAmmo: number;
  protected totalAmmo: number;

  private weapon!: Assets.GLTF;
  private asset!: Assets.GLTF;

  public aiming = false;
  private fire!: Fire;

  public constructor (private readonly config: WeaponConfig, envMap: Texture) {
    this.magazine = config.magazine;
    this.loadedAmmo = config.ammo;
    this.totalAmmo = config.ammo;

    this.load(envMap);
  }

  private async load (envMap: Texture): Promise<void> {
    this.weapon = (await Assets.Loader.loadGLTF(this.config.model)).scene;

    this.weapon.traverse(child => {
      const childMesh = child as Mesh;
      const material = childMesh.material as MeshStandardMaterial;

      if (childMesh.isMesh) {
        childMesh.castShadow = true;
        childMesh.receiveShadow = true;

        childMesh.material = new MeshStandardMaterial({
          emissiveIntensity: 0.025,
          emissive: Color.SILVER,
          refractionRatio: 0.75,

          transparent: true,
          map: material.map,
          side: FrontSide,

          roughness: 0.75,
          metalness: 0.25,
          envMap
        });
      }
    });

    this.weapon.position.copy(this.config.position as Vector3);
    this.weapon.rotation.copy(this.config.rotation as Euler);
    this.weapon.scale.copy(this.config.scale as Vector3);

    this.fire = new Fire(
      this.config.fire as FireConfig,
      this.weapon, this.config.textures
    );

    this.asset = this.model.clone();
  }

  /* private getEvent (index: number): string {
    const hitBox = index % 6;
    return !hitBox ? 'Hit:head' :
      hitBox === 1 ? 'Hit:body' : 'Hit:leg';
  } */

  protected playSound (sfx: WeaponSound, stop: boolean): void {
    stop && this.stopSound(sfx);

    GameEvents.dispatch('SFX::Weapon', {
      matrix: this.model.matrixWorld,
      play: true, sfx
    }, true);
  }

  protected stopSound (sfx: WeaponSound): void {
    GameEvents.dispatch('SFX::Weapon', {
      matrix: this.model.matrixWorld,
      play: false, sfx
    }, true);
  }

  public setAim (): void { return; }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected toggleVisibility (hideDelay: number, showDelay: number): void { return; }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public cancelAim (duration?: number): void { return; }

  public shoot (): Recoil | null {
    if (this.empty) this.playSound('empty', false);

    else {
      const target = this.target;
      const { ray } = this.raycaster;
      const hitBox = this.targets[target];

      const bullet = this.bullet.shoot(ray, this.aiming);
      !this.bullets.length && RAF.add(this.onUpdate);

      GameEvents.dispatch('Player::Shoot', true);
      const recoil = this.animateRecoil();

      this.playSound('shoot', true);
      this.bullets.push(bullet);
      this.fire.addParticles();

      this.loadedAmmo--;
      this.totalAmmo--;

      target > -1 && console.log(hitBox.position.distanceToSquared(bullet.position)); /* setTimeout(() =>
        GameEvents.dispatch(this.getEvent(target), hitBox.userData.enemy),
        Math.round(hitBox.position.distanceToSquared(bullet.position) / this.config.bullet.speed)
      ); */

      return recoil;
    }

    return null;
  }

  private animateRecoil (): Recoil {
    const recoil = this.recoil;
    if (!this.weapon) return recoil;

    const { x, y } = this.weapon.position;

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
    const visible = this.fire.update();

    for (let b = this.bullets.length; b--;) {
      const bullet = this.bullets[b];

      if (Date.now() < bullet.userData.lifeTime) {
        this.bullet.update(bullet);
      }

      else {
        this.bullets.splice(b, 1);
        !visible && RAF.remove(this.onUpdate);
        GameEvents.dispatch('Level::RemoveObject', bullet);
      }
    }
  }

  public startReloading (): void { return; }

  public stopReloading (): void { return; }

  public addAmmo (): void { return; }

  protected getClone (): Assets.GLTF {
    return this.asset as Assets.GLTF;
  }

  public resize (height: number): void {
    this.fire?.resize(height);
  }

  protected dispose (): void {
    for (let b = this.bullets.length; b--;) {
      const bullet = this.bullets[b];
      const path = bullet.children[0] as Mesh;
      const bulletMaterial = bullet.material as MeshStandardMaterial;

      GameEvents.dispatch('Level::RemoveObject', bullet);
      (path.material as ShaderMaterial).dispose();

      bulletMaterial.map?.dispose();
      bullet.geometry.dispose();

      bulletMaterial.dispose();
      path.geometry.dispose();
      bullet.clear();
    }

    RAF.remove(this.onUpdate);

    this.targets.splice(0);
    this.bullets.splice(0);

    this.bullet.dispose();
    this.fire.dispose();

    this.weapon.clear();
    this.asset.clear();
  }

  private get originOffset (): number {
    const { x, y } = this.config.bullet.position;
    return this.aiming ? y : x;
  }

  public get model (): Assets.GLTF {
    return this.weapon as Assets.GLTF;
  }

  private get recoil (): Recoil {
    const { x, y } = this.config.recoil;
    const energy = +this.aiming + 1;

    return {
      x: random(-x, x) / energy,
      y: y / energy
    };
  }

  private get target (): number {
    // const { x, y } = this.config.spread;

    // this.origin.x = random(-x, x);
    // this.origin.y = random(-y, y);

    this.weapon.getWorldPosition(this.origin);
    this.origin.y += this.originOffset;

    this.raycaster.ray.origin.copy(this.origin);
    this.camera.setFromMatrixPosition(CameraObject.matrixWorld);

    this.raycaster.ray.direction.copy(Vector.FORWARD)
      .unproject(CameraObject)
      .sub(this.camera)
      .normalize();

    const hitBoxes = this.raycaster.intersectObjects(this.targets);
    return hitBoxes.length ? this.targets.indexOf(hitBoxes[0].object) : -1;
  }

  public get inStock (): number {
    return this.totalAmmo - this.loadedAmmo;
  }

  public get damage (): number {
    return this.config.damage;
  }

  public get empty (): boolean {
    return !this.loadedAmmo;
  }

  public get full (): boolean {
    return this.loadedAmmo === this.magazine;
  }
}
