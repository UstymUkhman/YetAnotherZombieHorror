import type { CharacterConfig, CharacterAnimation, CharacterSound, CharacterMove } from '@/characters/types';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
import type { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import type { AnimationAction } from 'three/src/animation/AnimationAction';
import { AnimationMixer } from 'three/src/animation/AnimationMixer';
import type { Texture } from 'three/src/textures/Texture';

import { GameEvents } from '@/events/GameEvents';
import { Vector3 } from 'three/src/math/Vector3';
import { FrontSide } from 'three/src/constants';
import { Assets } from '@/loaders/AssetsLoader';
import { Mesh } from 'three/src/objects/Mesh';
import { Line3 } from 'three/src/math/Line3';

import { Material } from '@/utils/Material';
import { camelCase } from '@/utils/String';
import { Vector } from '@/utils/Vector';
import Physics from '@/physics';

export default abstract class Character
{
  protected animations: { [name: string]: AnimationAction } = {};
  protected currentAnimation!: AnimationAction;

  protected readonly direction = new Vector3();
  protected readonly position  = new Vector3();
  protected readonly rotation  = new Vector3();

  protected animationUpdate = false;
  protected readonly uuid: string;
  private mixer?: AnimationMixer;

  protected lastAnimation = '';
  private model?: Assets.GLTF;
  private step: CharacterMove;

  protected hitting = false;
  protected running = false;
  protected moving = false;

  protected object: Mesh;
  protected dead = false;
  private still = false;
  private health = 100;

  public constructor (private config: CharacterConfig) {
    const { x, y } = this.config.collider;

    this.object = new Mesh(
      new RoundedBoxGeometry(x, y, x, 2, 0.5),
      Material.DynamicCollider
    );

    this.object.userData = {
      segment: new Line3(new Vector3(), Vector.DOWN),
      height: y, radius: 0.5
    };

    this.step = this.config.moves.Idle;
    this.uuid = this.object.uuid;
  }

  protected updateAnimation (animation: CharacterAnimation, action: string, duration: number): NodeJS.Timeout {
    this.currentAnimation.crossFadeTo(this.animations[action], duration, true);
    this.animations[action].play();
    this.animationUpdate = true;

    return setTimeout(() => {
      this.lastAnimation = action;
      this.setAnimation(animation);

      this.currentAnimation.stop();
      this.animationUpdate = false;

      this.currentAnimation = this.animations[action];
    }, duration * 1e3);
  }

  protected async load (envMap?: Texture): Promise<Assets.GLTFModel> {
    const character = await Assets.Loader.loadGLTF(this.config.model);
    this.mesh = character.scene;

    this.setTransform(character);
    this.setMaterial(envMap, 1);
    return character;
  }

  protected playSound (sfx: CharacterSound, stop = false): void {
    stop && this.stopSound(sfx);

    GameEvents.dispatch('SFX::Character', {
      uuid: this.uuid, play: true, sfx,
      matrix: this.object.matrixWorld
    }, true);
  }

  protected setMaterial (envMap?: Texture, opacity = 0): void {
    this.mesh.traverse(child => {
      const childMesh = child as Mesh;
      const material = childMesh.material as MeshStandardMaterial;

      if (childMesh.isMesh) {
        childMesh.castShadow = true;
        childMesh.updateMorphTargets();

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

  protected getAnimationDuration (animation: string): number {
    return this.animations[animation].getClip().duration * 1e3;
  }

  private setAnimation (animation: CharacterAnimation): void {
    this.step = this.config.moves[animation];
  }

  private setAnimations (character: Assets.GLTFModel): void {
    const animations = character.animations as Assets.Animations;
    this.mixer = new AnimationMixer(this.mesh);

    for (let a = animations.length; a--;) {
      const clip = camelCase(animations[a].name);
      this.animations[clip] = this.mixer.clipAction(animations[a]);
    }

    this.currentAnimation = this.animations.idle;
  }

  protected setTransform (model: Assets.GLTFModel): void {
    this.object.position.copy(this.config.position as Vector3);
    this.mesh.position.set(0.0, this.config.collider.z, 0.0);
    this.object.scale.copy(this.config.scale as Vector3);

    this.rotation.setFromEuler(this.object.rotation);
    this.position.copy(this.object.position);

    this.object.add(this.mesh);
    this.setAnimations(model);
  }

  protected setMixerTimeScale (time: number): void {
    if (this.mixer) this.mixer.timeScale = time;
  }

  protected updateHealth (damage: number): boolean {
    if (this.dead) return true;
    this.health = Math.max(this.health - damage, 0.0);

    !this.health && this.die();
    return this.dead;
  }

  protected stopSound (sfx: CharacterSound): void {
    GameEvents.dispatch('SFX::Character', {
      uuid: this.uuid, play: false, sfx,
      matrix: this.object.matrixWorld
    }, true);
  }

  protected setMixerTime (time: number): void {
    this.mixer?.setTime(time);
  }

  public teleport (position: Vector3): void {
    Physics.pause = true;
    this.object.position.copy(position);
    this.mesh.rotateOnWorldAxis(Vector.UP, Math.PI);

    Physics.teleportCollider?.(this.object.uuid);
    Physics.pause = false;
  }

  protected update (delta: number): void {
    this.mixer?.update(delta);
    this.updateDirection();

    if (this.moving) {
      this.still = false;
      Physics.move(this.uuid, this.direction);
    }

    else if (!this.still) {
      this.still = true;
      Physics.stop(this.uuid);
    }
  }

  private updateDirection (): void {
    const { speed, direction } = this.step;

    this.mesh.getWorldDirection(this.rotation);
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

  public dispose (): void {
    this.object.userData = {};
    this.object.geometry.dispose();
    (this.object.material as MeshBasicMaterial).dispose();

    for (const animation in this.animations) {
      this.animations[animation].stopFading();
      this.animations[animation].stop();
      delete this.animations[animation];
    }

    if (this.model) {
      this.object.remove(this.model);
      this.model.clear();
      delete this.model;
    }

    Physics.remove(this.uuid);
    this.animations = {};
    delete this.mixer;
    this.reset();
  }

  protected die (): void {
    this.playSound('death', true);
    this.setAnimation('Idle');

    this.hitting = false;
    this.running = false;
    this.moving = false;

    this.still = false;
    this.dead = true;
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

  protected get blockingAnimation (): boolean {
    return this.animationUpdate;
  }

  protected set mesh (mesh: Assets.GLTF) {
    this.model = mesh;
  }

  protected get mesh (): Assets.GLTF {
    return this.model as Assets.GLTF;
  }

  protected get life (): number {
    return this.health;
  }

  public get collider (): Mesh {
    return this.object;
  }

  public get alive (): boolean {
    return !this.dead;
  }
}
