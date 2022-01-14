import type { CharacterConfig, CharacterAnimation, CharacterMove } from '@/characters/types';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
import type { AnimationAction } from 'three/src/animation/AnimationAction';
import { AnimationMixer } from 'three/src/animation/AnimationMixer';

import type { Texture } from 'three/src/textures/Texture';
import type { Object3D } from 'three/src/core/Object3D';
import { DynamicCollider } from '@/utils/Material';
import { Vector3 } from 'three/src/math/Vector3';

import { GameEvents } from '@/events/GameEvents';
import { FrontSide } from 'three/src/constants';
import { Assets } from '@/loaders/AssetsLoader';
import { Mesh } from 'three/src/objects/Mesh';

import { Line3 } from 'three/src/math/Line3';
import { camelCase } from '@/utils/String';
import { Vector } from '@/utils/Vector';
import Physics from '@/physics';

export default class Character
{
  protected animations: { [name: string]: AnimationAction } = {};
  private step: CharacterMove = this.config.moves.Idle;

  protected readonly direction = new Vector3();
  protected readonly position  = new Vector3();
  protected readonly rotation  = new Vector3();

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

  protected async load (envMap?: Texture): Promise<Assets.GLTFModel> {
    const character = await Assets.Loader.loadGLTF(this.config.model);

    character.scene.position.set(0.0, this.config.collider.z, 0.0);
    if (character.animations) this.createAnimations(character);

    this.object.position.copy(this.config.position as Vector3);
    this.object.scale.copy(this.config.scale as Vector3);
    this.object.rotation.toVector3(this.rotation);

    this.setCharacterMaterial(character.scene, envMap);
    this.position.copy(this.object.position);
    this.object.add(character.scene);

    this.model = character.scene;
    return character;
  }

  protected setCharacterMaterial (model: Assets.GLTF, envMap?: Texture, opacity = 1): void {
    model.traverse(child => {
      const childMesh = child as Mesh;
      const material = childMesh.material as MeshStandardMaterial;

      if (childMesh.isMesh) {
        childMesh.castShadow = true;

        childMesh.material = new MeshStandardMaterial({
          envMap: envMap ?? null,
          transparent: true,
          map: material.map,
          side: FrontSide,
          opacity
        });
      }
    });
  }

  protected createAnimations (character: Assets.GLTFModel): void {
    const animations = character.animations as Assets.Animations;
    this.mixer = new AnimationMixer(character.scene);

    for (let a = animations.length; a--;) {
      const clip = camelCase(animations[a].name);
      this.animations[clip] = this.mixer.clipAction(animations[a]);
    }
  }

  protected setAnimation (animation: CharacterAnimation): void {
    this.step = this.config.moves[animation];
  }

  protected getAnimationDuration (animation: string): number {
    return this.animations[animation].getClip().duration;
  }

  protected setMixerTimeScale (time: number): void {
    if (this.mixer) this.mixer.timeScale = time;
  }

  protected setMixerTime (time: number): void {
    this.mixer?.setTime(time);
  }

  private updateLocation (): void {
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
    this.updateLocation();

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

  protected death (player = false): void {
    GameEvents.dispatch('SFX::Character', {
      matrix: this.object.matrixWorld,
      sfx: 'death', player
    }, true);

    this.hitting = false;
    this.running = false;
    this.moving = false;

    this.still = false;
    this.dead = true;
  }

  public teleport (position: Vector3): void {
    Physics.pause = true;

    this.object.position.copy(position);
    this.getModel().rotateOnWorldAxis(Vector.UP, Math.PI);

    Physics.teleportCollider?.(this.object.uuid);
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

    for (let c = children.length; c--;)
      model.remove(children[c]);

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
