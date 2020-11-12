import { WeaponConfig, WeaponSounds, WeaponSound, Recoil } from '@/types';
import { MeshPhongMaterial } from '@three/materials/MeshPhongMaterial';
import { CameraObject, CameraListener } from '@/managers/GameCamera';
import { PositionalAudio } from '@three/audio/PositionalAudio';

type Object3D = import('@three/core/Object3D').Object3D;
type Vector3 = import('@three/math/Vector3').Vector3;

import { GameEvents } from '@/managers/GameEvents';
import { Raycaster } from '@three/core/Raycaster';
import { Assets } from '@/managers/AssetsLoader';

type Mesh = import('@three/objects/Mesh').Mesh;
type Euler = import('@three/math/Euler').Euler;

import { Vector2 } from '@three/math/Vector2';
import { FrontSide } from '@three/constants';
import { random } from '@/utils/Number';

export default class Weapon {
  private readonly sounds: WeaponSounds = new Map();
  private readonly loader = new Assets.Loader();
  private readonly raycaster = new Raycaster();
  private readonly origin = new Vector2();

  public targets: Array<Object3D> = [];
  private weapon?: Assets.GLTF;

  private readonly aimNear = 3.0;
  private readonly near = 4.5;

  private loadedAmmo: number;
  private totalAmmo: number;
  private magazine: number;
  private aiming = false;

  public constructor (private readonly config: WeaponConfig) {
    this.raycaster.near = this.near;
    this.magazine = config.magazine;

    this.loadedAmmo = config.ammo;
    this.totalAmmo = config.ammo;

    this.load();
  }

  private async load (): Promise<Assets.GLTF> {
    this.weapon = (await this.loader.loadGLTF(this.config.model)).scene;
    this.addSounds(await this.loadSounds());

    this.weapon.traverse(child => {
      const childMesh = child as Mesh;
      const material = childMesh.material as MeshPhongMaterial;

      if (childMesh.isMesh) {
        childMesh.castShadow = true;

        childMesh.material = new MeshPhongMaterial({
          specular: 0x2F2F2F,
          map: material.map,
          side: FrontSide
        });
      }
    });

    this.weapon.position.copy(this.config.position as Vector3);
    this.weapon.rotation.copy(this.config.rotation as Euler);
    this.weapon.scale.copy(this.config.scale as Vector3);

    return this.weapon;
  }

  private addSounds (sounds: Array<AudioBuffer>): void {
    const sfx = Object.keys(this.config.sounds) as unknown as Array<WeaponSound>;

    sounds.forEach((sound, s) => {
      const audio = new PositionalAudio(CameraListener);
      const volume = sfx[s] === 'shoot' ? 10 : 5;

      this.sounds.set(sfx[s], audio);
      this.weapon?.add(audio);

      audio.setVolume(volume);
      audio.setBuffer(sound);
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
    return !hitBox ? 'headshoot' :
      hitBox === 1 ? 'bodyHit' : 'legHit';
  }

  protected stopSound (sfx: WeaponSound): PositionalAudio {
    const sound = this.sounds.get(sfx) as PositionalAudio;
    if (sound.isPlaying) sound.stop();
    return sound;
  }

  protected playSound (sfx: WeaponSound): void {
    this.stopSound(sfx).play();
  }

  // public setToPlayer (): void { return; }

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  public setAim (duration: number): void { return; }

  public cancelAim (): void { return; }

  public shoot (player: Vector3): boolean {
    const shoot = !this.empty;
    const target = this.target;

    if (!shoot) this.playSound('empty');

    else {
      const hitBox = this.targets[target];
      GameEvents.dispatch('player:shoot');

      this.playSound('shoot');
      this.loadedAmmo--;

      target > -1 && setTimeout(() =>
        GameEvents.dispatch(this.getEvent(target), hitBox.userData.enemy),
        Math.round(hitBox.position.distanceTo(player) / this.config.speed)
      );
    }

    return shoot;
  }

  public reload (): void { return; }

  public cancelReload (): void { return; }

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
