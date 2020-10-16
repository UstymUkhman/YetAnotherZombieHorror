type WeaponSettings = import('@/settings').Settings.Weapon;
// type Vector2 = import('@three/math/Vector2').Vector2;
type Vector3 = import('@three/math/Vector3').Vector3;
type Mesh = import('@three/objects/Mesh').Mesh;

import { MeshPhongMaterial } from '@three/materials/MeshPhongMaterial';
import { PositionalAudio } from '@three/audio/PositionalAudio';

import { /* object, */ listener } from '@/managers/Camera';
import { Raycaster } from '@three/core/Raycaster';
import { Assets } from '@/managers/AssetsLoader';
import { FrontSide } from '@three/constants';

export default class Weapon {
  private readonly loader = new Assets.Loader();
  private readonly raycaster = new Raycaster();

  // private readonly spread: Vector2;
  // private readonly recoil: Vector2;
  private enemies!: Array<Mesh>;
  private weapon?: Assets.GLTF;

  private readonly aimNear = 3.0;
  private readonly near = 4.5;
  private aiming = false;

  public constructor (private readonly settings: WeaponSettings) {
    // this.spread = settings.spread as Vector2;
    // this.recoil = settings.recoil as Vector2;

    this.raycaster.near = this.near;
    this.load();
  }

  private async load (): Promise<Assets.GLTF> {
    this.weapon = (await this.loader.loadGLTF(this.settings.model)).scene;
    this.addSounds(Object.keys(this.settings.sounds), await this.loadSounds());

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

    this.weapon.rotation.setFromVector3(this.settings.rotation as Vector3);
    this.weapon.position.copy(this.settings.position as Vector3);
    this.weapon.scale.copy(this.settings.scale as Vector3);

    return this.weapon;
  }

  private addSounds (names: Array<string>, sounds: Array<AudioBuffer>): void {
    sounds.forEach((sound, s) => {
      const volume = names[s] === 'shoot' ? 10 : 5;
      const audio = new PositionalAudio(listener);

      this.weapon?.add(audio);
      audio.setVolume(volume);
      audio.setBuffer(sound);
    });
  }

  private async loadSounds (): Promise<Array<AudioBuffer>> {
    return await Promise.all(
      Object.values(this.settings.sounds)
        .map(this.loader.loadAudio.bind(this.loader))
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public cancelReload (): void { }

  protected set aim (aiming: boolean) {
    this.raycaster.near = aiming ? this.aimNear : this.near;
    this.aiming = aiming;
  }

  protected get aim (): boolean {
    return this.aiming;
  }

  public set targets (colliders: Array<Mesh>) {
    this.enemies = colliders;
  }

  public get model (): Assets.GLTF | undefined {
    return this.weapon;
  }

  public get damage (): number {
    return this.settings.damage;
  }
}
