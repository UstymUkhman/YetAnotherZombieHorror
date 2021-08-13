import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
import type { WeaponConfig, WeaponSound, Recoil } from '@/weapons/types';

import type { Texture } from 'three/src/textures/Texture';
import type { Object3D } from 'three/src/core/Object3D';
import type { Vector3 } from 'three/src/math/Vector3';

import { CameraObject } from '@/managers/GameCamera';
import { Raycaster } from 'three/src/core/Raycaster';

import type { Mesh } from 'three/src/objects/Mesh';
import type { Euler } from 'three/src/math/Euler';
import { GameEvents } from '@/events/GameEvents';

import { Vector2 } from 'three/src/math/Vector2';
import { FrontSide } from 'three/src/constants';
import { Assets } from '@/loaders/AssetsLoader';

import { random } from '@/utils/Number';
import { Color } from '@/utils/Color';

export default class Weapon
{
  private readonly raycaster = new Raycaster();
  private readonly origin = new Vector2();

  public targets: Array<Object3D> = [];
  protected readonly magazine: number;

  private readonly aimNear = 3.0;
  private readonly near = 4.5;

  private weapon?: Assets.GLTF;
  private asset?: Assets.GLTF;

  protected loadedAmmo: number;
  protected totalAmmo: number;
  private aiming = false;

  public constructor (private readonly config: WeaponConfig, envMap: Texture) {
    this.raycaster.near = this.near;
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

    this.asset = this.model.clone();
  }

  private getEvent (index: number): string {
    const hitBox = index % 6;
    return !hitBox ? 'Hit:head' :
      hitBox === 1 ? 'Hit:body' : 'Hit:leg';
  }

  protected playSound (sfx: WeaponSound, stop: boolean): void {
    stop && this.stopSound(sfx);

    GameEvents.dispatch('SFX:Weapon', {
      matrix: this.model.matrixWorld,
      play: true, sfx
    }, true);
  }

  protected stopSound (sfx: WeaponSound): void {
    GameEvents.dispatch('SFX:Weapon', {
      matrix: this.model.matrixWorld,
      play: false, sfx
    }, true);
  }

  public setAim (): void { return; }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public cancelAim (duration?: number): void { return; }

  public shoot (player: Vector3): boolean {
    const shoot = !this.empty;
    const target = this.target;

    if (!shoot) this.playSound('empty', false);

    else {
      const hitBox = this.targets[target];
      GameEvents.dispatch('Player:shoot');

      this.playSound('shoot', true);
      this.loadedAmmo--;

      target > -1 && setTimeout(() =>
        GameEvents.dispatch(this.getEvent(target), hitBox.userData.enemy),
        Math.round(hitBox.position.distanceTo(player) / this.config.speed)
      );
    }

    return shoot;
  }

  public startReloading (): void { return; }

  public stopReloading (): void { return; }

  public addAmmo (): void { return; }

  protected getClone (): Assets.GLTF {
    return this.asset as Assets.GLTF;
  }

  private get target (): number {
    const x = this.config.spread.x / 10;
    const y = this.config.spread.y / 10;

    this.origin.x += random(-x, x);
    this.origin.y += random(-y, y);

    this.raycaster.setFromCamera(this.origin, CameraObject);
    const hitBoxes = this.raycaster.intersectObjects(this.targets);
    return hitBoxes.length ? this.targets.indexOf(hitBoxes[0].object) : -1;
  }

  public get recoil (): Recoil {
    const { x, y } = this.config.recoil;
    const energy = ~~this.aiming + 1;

    return {
      x: random(-x, x) / energy,
      y: y / energy
    };
  }

  public set aim (aiming: boolean) {
    this.raycaster.near = aiming ? this.aimNear : this.near;
    this.aiming = aiming;
  }

  public get aim (): boolean {
    return this.aiming;
  }

  public get model (): Assets.GLTF {
    return this.weapon as Assets.GLTF;
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

  public get ammo (): number {
    return this.totalAmmo;
  }
}
