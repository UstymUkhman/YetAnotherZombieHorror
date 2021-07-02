import type { WeaponConfig, WeaponSounds, WeaponSound, Recoil } from '@/types.d';
import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
import { CameraObject, CameraListener } from '@/managers/GameCamera';
import { PositionalAudio } from 'three/src/audio/PositionalAudio';

import type { Object3D } from 'three/src/core/Object3D';
import type { Vector3 } from 'three/src/math/Vector3';

import { Raycaster } from 'three/src/core/Raycaster';
import { GameEvents } from '@/managers/GameEvents';
import { Assets } from '@/managers/AssetsLoader';

import type { Mesh } from 'three/src/objects/Mesh';
import type { Euler } from 'three/src/math/Euler';

import { Vector2 } from 'three/src/math/Vector2';
import { FrontSide } from 'three/src/constants';
import { random } from '@/utils/Number';

export default class Weapon
{
  private readonly sounds: WeaponSounds = new Map();
  private readonly loader = new Assets.Loader();
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

  public constructor (private readonly config: WeaponConfig) {
    this.raycaster.near = this.near;
    this.magazine = config.magazine;

    this.loadedAmmo = config.ammo;
    this.totalAmmo = config.ammo;

    this.load();
  }

  private async load (): Promise<void> {
    this.weapon = (await this.loader.loadGLTF(this.config.model)).scene;

    this.weapon.traverse(child => {
      const childMesh = child as Mesh;
      const material = childMesh.material as MeshStandardMaterial;

      if (childMesh.isMesh) {
        childMesh.castShadow = true;

        childMesh.material = new MeshStandardMaterial({
          emissiveIntensity: 0.025,
          refractionRatio: 0.75,
          emissive: 0xC0C0C0,
          map: material.map,
          side: FrontSide,
          roughness: 0.75,
          metalness: 0.25
        });
      }
    });

    this.weapon.position.copy(this.config.position as Vector3);
    this.weapon.rotation.copy(this.config.rotation as Euler);
    this.weapon.scale.copy(this.config.scale as Vector3);

    this.asset = this.model.clone() as Assets.GLTF;
    this.addSounds(await this.loadSounds());
  }

  private addSounds (sounds: Array<AudioBuffer>): void {
    const sfx = Object.keys(this.config.sounds) as unknown as Array<WeaponSound>;

    sounds.forEach((sound, s) => {
      const audio = new PositionalAudio(CameraListener);
      const volume = sfx[s] === 'shoot' ? 10 : 5;

      audio.setBuffer(sound);
      audio.setVolume(volume);

      this.sounds.set(sfx[s], audio);
      this.model.add(audio);
    });
  }

  private async loadSounds (): Promise<Array<AudioBuffer>> {
    return await Promise.all(
      Object.values(this.config.sounds)
        .map(this.loader.loadAudio.bind(this.loader))
    );
  }

  private getEvent (index: number): string {
    const hitBox = index % 6;
    return !hitBox ? 'hit:head' :
      hitBox === 1 ? 'hit:body' : 'hit:leg';
  }

  protected stopSound (sfx: WeaponSound): PositionalAudio {
    const sound = this.sounds.get(sfx) as PositionalAudio;
    if (sound.isPlaying) sound.stop();
    return sound;
  }

  protected playSound (sfx: WeaponSound, stop: boolean): void {
    const sound = stop
      ? this.stopSound(sfx)
      : this.sounds.get(sfx) as PositionalAudio;

    !sound.isPlaying && sound.play();
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
      GameEvents.dispatch('player:shoot');

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
    const clone = this.asset as Assets.GLTF;
    this.sounds.forEach(sound => clone.add(sound));
    return clone;
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
