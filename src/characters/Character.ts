type AnimationAction = import('@three/animation/AnimationAction').AnimationAction;
type AudioListener = import('@three/audio/AudioListener').AudioListener;
type CharacterAnimations = import('@/settings').Settings.Animations;
type CharacterAnimation = import('@/settings').Settings.Animation;
type CharacterSettings = import('@/settings').Settings.Character;

import { MeshPhongMaterial } from '@three/materials/MeshPhongMaterial';
import { AnimationMixer } from '@three/animation/AnimationMixer';
import { PositionalAudio } from '@three/audio/PositionalAudio';
// type CharacterSounds = import('@/settings').Settings.Sounds;
// type BoundsSettings = import('@/settings').Settings.Bounds;

type Vector3 = import('@three/math/Vector3').Vector3;
type Actions = { [name: string]: AnimationAction };
type Mesh = import('@three/objects/Mesh').Mesh;

import { Assets } from '@/managers/AssetsLoader';
import { camelCase } from '@/utils/String';
// import { clamp } from '@/utils/number';

export default class Character {
  private readonly loader = new Assets.Loader();
  private settings: CharacterSettings;
  protected animations: Actions = {};

  // private sounds: CharacterSounds;
  private mixer?: AnimationMixer;
  private speed = { x: 0, z: 0 };
  private model?: Assets.GLTF;

  private running = false;
  protected alive = true;
  private moving = false;
  private health = 100;

  public constructor (settings: CharacterSettings) {
    this.settings = settings;
  }

  public async load (): Promise<Assets.GLTFModel> {
    const character = await this.loader.loadGLTF(this.settings.model);

    character.scene.position.copy(this.settings.position as Vector3);
    character.scene.scale.copy(this.settings.scale as Vector3);

    this.setCharacterMaterial(character.scene);

    if (character.animations) {
      this.createAnimations(character);
    }

    this.model = character.scene;
    return character;
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
    const animations = this.settings.animations as CharacterAnimations;

    this.speed.x = animations[animation][0];
    this.speed.z = animations[animation][1];
  }

  protected createAudio (sound: AudioBuffer, listener: AudioListener, volume = 10): PositionalAudio {
    const audio = new PositionalAudio(listener);

    audio.setVolume(volume);
    audio.setBuffer(sound);

    return audio;
  }

  protected update (delta: number): void {
    this.mixer?.update(delta);

    if (this.moving && this.model) {
      this.model.translateX(this.speed.x);
      this.model.translateZ(this.speed.z);

      // this.model.position.z = clamp(
      //   this.model.position.z,
      //   -BOUNDS.front,
      //   BOUNDS.front
      // );

      // this.model.position.x = clamp(
      //   this.model.position.x,
      //   -BOUNDS.side,
      //   BOUNDS.side
      // );
    }
  }

  protected checkIfAlive (): void {
    if (!this.alive) return;
    this.alive = this.alive && this.health > 0;
    // if (!this.alive) this.death();
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

    delete this.animations;
    // delete this.colliders;
    delete this.model;
    delete this.settings;
    // delete this.sounds;
    delete this.speed;
  }

  public reset (): void {
    this.speed = { x: 0, z: 0 };
    this.running = false;
    this.moving = false;

    this.health = 100;
    this.alive = true;
  }

  /* public set bounds (bounds: BoundsSettings) {
    this.bounds = bounds;
  }

  public get bounds (): BoundsSettings {
    return this.bounds;
  } */
}
