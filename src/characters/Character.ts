type AnimationAction = import('@three/animation/AnimationAction').AnimationAction;
type AudioListener = import('@three/audio/AudioListener').AudioListener;

type CharacterAnimation = import('@/config').Config.Animation;
type CharacterConfig = import('@/config').Config.Character;
// type CharacterSounds = import('@/config').Config.Sounds;

type Vector3 = import('@three/math/Vector3').Vector3;
type Actions = { [name: string]: AnimationAction };
type Move = import('@/config').Config.Move;

import { MeshPhongMaterial } from '@three/materials/MeshPhongMaterial';
import { AnimationMixer } from '@three/animation/AnimationMixer';
import { PositionalAudio } from '@three/audio/PositionalAudio';

import CapsuleGeometry from '@/utils/CapsuleGeometry';
import { DynamicCollider } from '@/utils/Material';
import { Assets } from '@/managers/AssetsLoader';

import { camelCase } from '@/utils/String';
import { Mesh } from '@three/objects/Mesh';
import Physics from '@/managers/Physics';

export default class Character {
  private readonly loader = new Assets.Loader();
  private step: Move = this.config.moves.Idle;

  protected animations: Actions = { };
  // private sounds: CharacterSounds;

  private mixer?: AnimationMixer;
  private model?: Assets.GLTF;
  protected object: Mesh;

  protected running = false;
  protected moving = false;
  protected dead = false;

  private still = false;
  private health = 100;

  public constructor (private config: CharacterConfig) {
    const { x, y } = this.config.collider;
    this.object = new Mesh(new CapsuleGeometry(x, y), DynamicCollider);
  }

  protected setCharacterMaterial (character: Assets.GLTF, opacity = 1): void {
    character.traverse(child => {
      const childMesh = child as Mesh;
      const material = childMesh.material as MeshPhongMaterial;

      if (childMesh.isMesh) {
        childMesh.castShadow = true;

        childMesh.material = new MeshPhongMaterial({
          map: material.map,
          specular: 0x000000,
          transparent: true,
          skinning: true,
          shininess: 0,
          opacity
        });
      }
    });
  }

  protected createAnimations (model: Assets.GLTFModel): void {
    const animations = model.animations as Assets.Animations;
    this.mixer = new AnimationMixer(model.scene);

    for (let a = 0; a < animations.length; a++) {
      const clip = camelCase(animations[a].name);
      this.animations[clip] = this.mixer.clipAction(animations[a]);
    }
  }

  protected setAnimation (animation: CharacterAnimation): void {
    this.step = this.config.moves[animation];
  }

  protected createAudio (sound: AudioBuffer, listener: AudioListener, volume = 10): PositionalAudio {
    const audio = new PositionalAudio(listener);

    audio.setVolume(volume);
    audio.setBuffer(sound);

    return audio;
  }

  protected turn (x: number /*, y: number */): void {
    // (this.model as Assets.GLTF).rotation.x = y;
    Physics.rotate(x);
  }

  protected update (delta: number): void {
    this.mixer?.update(delta);

    if (this.moving) {
      Physics.move(this.step);
      this.still = false;
    }

    else if (!this.still) {
      this.still = true;
      Physics.stop();
    }
  }

  protected checkIfAlive (): void {
    if (this.dead) return;
    this.dead = this.dead || !this.health;
    // this.dead && this.death();
  }

  public async load (): Promise<Assets.GLTFModel> {
    const character = await this.loader.loadGLTF(this.config.model);
    character.scene.position.set(0, this.config.collider.z, 0);

    this.object.position.copy(this.config.position as Vector3);
    this.object.scale.copy(this.config.scale as Vector3);

    this.setCharacterMaterial(character.scene);
    this.object.add(character.scene);

    if (character.animations) {
      this.createAnimations(character);
    }

    this.model = character.scene;
    return character;
  }

  public dispose (): void {
    const children = this.model?.children;

    // this.rightUpLeg.remove(this.colliders[2]);
    // this.leftUpLeg.remove(this.colliders[3]);
    // this.rightLeg.remove(this.colliders[4]);
    // this.leftLeg.remove(this.colliders[5]);
    // this.spine.remove(this.colliders[1]);
    // this.head.remove(this.colliders[0]);

    // for (let c = 0; c < this.colliders.length; c++) {
    //   this.colliders.splice(c, 1);
    // }

    for (let c = 0; children && c < children.length; c++) {
      this.model?.remove(children[c]);
    }

    for (const animation in this.animations) {
      this.animations[animation].stopFading();
      this.animations[animation].stop();
      delete this.animations[animation];
    }

    // delete this.colliders;
    // delete this.sounds;
    delete this.model;
  }

  public reset (): void {
    this.step = this.config.moves.Idle;
    this.running = false;
    this.moving = false;

    this.health = 100;
    this.dead = false;
  }

  public get collider (): Mesh {
    return this.object;
  }

  public get alive (): boolean {
    return !this.dead;
  }
}
