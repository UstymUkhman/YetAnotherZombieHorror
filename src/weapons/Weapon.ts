import { /* CameraObject, */ CameraListener } from '@/managers/GameCamera';
import { MeshPhongMaterial } from '@three/materials/MeshPhongMaterial';
import { PositionalAudio } from '@three/audio/PositionalAudio';

// type Vector2 = import('@three/math/Vector2').Vector2;
type Vector3 = import('@three/math/Vector3').Vector3;
type WeaponConfig = import('@/config').Config.Weapon;

import { Raycaster } from '@three/core/Raycaster';
import { Assets } from '@/managers/AssetsLoader';
import { FrontSide } from '@three/constants';

type Mesh = import('@three/objects/Mesh').Mesh;
type Euler = import('@three/math/Euler').Euler;

export default class Weapon {
  private readonly loader = new Assets.Loader();
  private readonly raycaster = new Raycaster();

  // private readonly spread: Vector2;
  // private readonly recoil: Vector2;
  public targets: Array<Mesh> = [];
  private weapon?: Assets.GLTF;

  private readonly aimNear = 3.0;
  private readonly near = 4.5;
  private aiming = false;

  public constructor (private readonly config: WeaponConfig) {
    // this.spread = config.spread as Vector2;
    // this.recoil = config.recoil as Vector2;

    this.raycaster.near = this.near;
    this.load();
  }

  private async load (): Promise<Assets.GLTF> {
    this.weapon = (await this.loader.loadGLTF(this.config.model)).scene;
    this.addSounds(Object.keys(this.config.sounds), await this.loadSounds());

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

  private addSounds (names: Array<string>, sounds: Array<AudioBuffer>): void {
    sounds.forEach((sound, s) => {
      const audio = new PositionalAudio(CameraListener);
      const volume = names[s] === 'shoot' ? 10 : 5;

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

  public cancelReload (): void { return; }

  protected set aim (aiming: boolean) {
    this.raycaster.near = aiming ? this.aimNear : this.near;
    this.aiming = aiming;
  }

  protected get aim (): boolean {
    return this.aiming;
  }

  public get model (): Assets.GLTF {
    return this.weapon as Assets.GLTF;
  }

  public get damage (): number {
    return this.config.damage;
  }
}
