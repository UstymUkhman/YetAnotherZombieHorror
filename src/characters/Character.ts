import type { CharacterConfig, CharacterAnimation, CharacterMove, CharacterSounds, CharacterSound } from '@/types.d';
type Actions = { [name: string]: import('three/src/animation/AnimationAction').AnimationAction };
type Object3D = import('three/src/core/Object3D').Object3D;

import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial';
import { AnimationMixer } from 'three/src/animation/AnimationMixer';
import { PositionalAudio } from 'three/src/audio/PositionalAudio';
import { FrontSide, DoubleSide } from 'three/src/constants';

import { CameraListener } from '@/managers/GameCamera';
import { DynamicCollider } from '@/utils/Material';
import { Vector3 } from 'three/src/math/Vector3';
import { Assets } from '@/managers/AssetsLoader';
import { Mesh } from 'three/src/objects/Mesh';

import { Line3 } from 'three/src/math/Line3';
import { camelCase } from '@/utils/String';
import Physics from '@/managers/physics';
import { Vector } from '@/utils/Vector';
import { Color } from '@/utils/Color';

export default class Character
{
  private step: CharacterMove = this.config.moves.Idle;
  private readonly sounds: CharacterSounds = new Map();
  private readonly loader = new Assets.Loader();

  protected readonly direction = new Vector3();
  protected readonly position  = new Vector3();
  protected readonly rotation  = new Vector3();

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

    this.object = new Mesh(
      new RoundedBoxGeometry(x, y, x, 2, 0.5),
      DynamicCollider
    );

    this.object.userData = {
      segment: new Line3(new Vector3(), Vector.DOWN),
      height: y, radius: 0.5
    };
  }

  protected setCharacterMaterial (character: Assets.GLTF, opacity = 1): void {
    const side = opacity ? DoubleSide : FrontSide;

    character.traverse(child => {
      const childMesh = child as Mesh;
      const material = childMesh.material as MeshPhongMaterial;

      if (childMesh.isMesh) {
        childMesh.castShadow = true;

        childMesh.material = new MeshPhongMaterial({
          specular: Color.BLACK,
          map: material.map,
          transparent: true,
          shininess: 0,
          opacity,
          side
        });
      }
    });
  }

  protected createAnimations (model: Assets.GLTFModel): void {
    const animations = model.animations as Assets.Animations;
    this.mixer = new AnimationMixer(model.scene);

    for (let a = animations.length; a--;) {
      const clip = camelCase(animations[a].name);
      this.animations[clip] = this.mixer.clipAction(animations[a]);
    }
  }

  protected setAnimation (animation: CharacterAnimation): void {
    this.step = this.config.moves[animation];
  }

  protected setMixerTime (time: number): void {
    this.mixer?.setTime(time);
  }

  private updateCharacterLocation (): void {
    const model = this.getModel();
    const { speed, direction } = this.step;

    model.getWorldDirection(this.rotation);
    this.object.getWorldPosition(this.position);

    const x = this.rotation.x * speed;
    const z = this.rotation.z * speed;

    const { z0, x0, x1 } = direction;
    const min = Math.min(x0, x1);

    this.direction.set(
      x * z0 + x * min + z * x1,
      -1.0,
      z * z0 + z * min + x * x0
    );
  }

  protected update (delta: number): void {
    this.mixer?.update(delta);
    this.updateCharacterLocation();

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

  protected getModel (): Assets.GLTF {
    return this.model as Assets.GLTF;
  }

  protected death (): void {
    this.sounds.get('death')?.play();
    this.hitting = false;
    this.running = false;
    this.moving = false;
    this.still = false;
    this.dead = true;
  }

  public async load (): Promise<Assets.GLTFModel> {
    const character = await this.loader.loadGLTF(this.config.model);
    character.scene.position.set(0, this.config.collider.z, 0);

    this.object.position.copy(this.config.position as Vector3);
    this.object.scale.copy(this.config.scale as Vector3);
    this.object.rotation.toVector3(this.rotation);

    this.setCharacterMaterial(character.scene);
    this.position.copy(this.object.position);
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

  public teleport (position: Vector3): void {
    Physics.pause = true;

    this.object.position.copy(position);
    this.getModel().rotateOnWorldAxis(Vector.UP, Math.PI);

    Physics.teleportCollider(this.object.uuid);
    Physics.pause = false;
  }

  public dispose (): void {
    const model = this.getModel();
    const children = model.children as Array<Object3D>;

    for (const animation in this.animations) {
      this.animations[animation].stopFading();
      this.animations[animation].stop();
      delete this.animations[animation];
    }

    for (let c = children.length; c--;) {
      model.remove(children[c]);
    }

    delete this.mixer;
    delete this.model;
  }

  public reset (): void {
    this.step = this.config.moves.Idle;

    this.direction.setScalar(0);
    this.position.setScalar(0);
    this.rotation.setScalar(0);

    this.hitting = false;
    this.running = false;
    this.moving = false;

    this.health = 100;
    this.still = true;
    this.dead = false;
  }

  public get collider (): Mesh {
    return this.object;
  }

  public get alive (): boolean {
    return !this.dead;
  }
}
