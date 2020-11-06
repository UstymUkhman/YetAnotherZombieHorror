import { CharacterConfig, CharacterAnimation, CharacterMove, CharacterSounds, CharacterSound } from '@/types';
type AnimationAction = import('@three/animation/AnimationAction').AnimationAction;
type Actions = { [name: string]: AnimationAction };

import { MeshPhongMaterial } from '@three/materials/MeshPhongMaterial';
import { AnimationMixer } from '@three/animation/AnimationMixer';
import { PositionalAudio } from '@three/audio/PositionalAudio';

import { CameraListener } from '@/managers/GameCamera';
import CapsuleGeometry from '@/utils/CapsuleGeometry';
import { DynamicCollider } from '@/utils/Material';
import { Assets } from '@/managers/AssetsLoader';
import { Vector3 } from '@three/math/Vector3';

import { camelCase } from '@/utils/String';
import { Mesh } from '@three/objects/Mesh';
import Physics from '@/managers/Physics';

export default class Character {
  private readonly directionVector = new Vector3(0, -1, 0);
  private step: CharacterMove = this.config.moves.Idle;

  private readonly sounds: CharacterSounds = new Map();
  private readonly loader = new Assets.Loader();

  protected animations: Actions = {};
  private mixer?: AnimationMixer;
  private model?: Assets.GLTF;
  protected object: Mesh;

  protected hitting = false;
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

  protected turn (y: number, x = 0): void {
    (this.model as Assets.GLTF).rotation.y += y;
    (this.model as Assets.GLTF).rotation.x += x;
  }

  protected update (delta: number): void {
    this.mixer?.update(delta);

    if (this.moving) {
      Physics.move(this.direction);
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

  public addSounds (sounds: Array<AudioBuffer>): void {
    const sfx = Object.keys(this.config.sounds) as unknown as Array<CharacterSound>;

    sounds.forEach((sound, s) => {
      const audio = new PositionalAudio(CameraListener);

      this.sounds.set(sfx[s], audio);
      this.object.add(audio);

      audio.setBuffer(sound);
      audio.setVolume(10);
    });
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
    delete this.mixer;
    delete this.model;
  }

  public reset (): void {
    this.step = this.config.moves.Idle;

    this.hitting = false;
    this.running = false;
    this.moving = false;

    this.health = 100;
    this.still = true;
    this.dead = false;
  }

  private get direction (): Vector3 {
    (this.model as Assets.GLTF).getWorldDirection(this.directionVector);
    this.directionVector.multiplyScalar(this.step.speed);

    const { z0, x0, x1 } = this.step.direction;
    const { x, z } = this.directionVector;
    const min = Math.min(x0, x1);

    this.directionVector.setX(x * z0 + x * min + z * x1);
    this.directionVector.setZ(z * z0 + z * min + x * x0);

    return this.directionVector;
  }

  public get collider (): Mesh {
    return this.object;
  }

  public get alive (): boolean {
    return !this.dead;
  }
}
