type AnimationAction = import('@three/animation/AnimationAction').AnimationAction;
import { MeshPhongMaterial } from '@three/materials/MeshPhongMaterial';
import { AnimationMixer } from '@three/animation/AnimationMixer';

import { Assets } from '@/managers/AssetsLoader';
import { camelCase } from '@/utils/string';
// import { clamp } from '@/utils/number';
import { Settings } from '@/settings';

type LoadCallback = (character: Assets.GLTFModel) => void
type Actions = { [name: string]: AnimationAction }

type Vector3 = import('@three/math/Vector3').Vector3;
type Mesh = import('@three/objects/Mesh').Mesh;

export default class Character {
  protected character: Assets.GLTF | null = null;
  private readonly loader = new Assets.Loader();
  private mixer: AnimationMixer | null = null;

  private settings: Settings.Character;
  private animations: Actions = {};
  // private sounds: Settings.Sounds;
  private speed = { x: 0, z: 0 };

  private running = false;
  private moving = false;
  private health = 100;
  private alive = true;

  public constructor (settings: Settings.Character, onLoad?: LoadCallback) {
    this.settings = settings;
    if (onLoad) this.load(onLoad);
  }

  private async load (callback: LoadCallback): Promise<Assets.GLTFModel> {
    const character = await this.loader.loadGLTF(this.settings.model);

    character.scene.position.copy(this.settings.position as Vector3);
    character.scene.scale.copy(this.settings.scale as Vector3);

    this.setCharacterMaterial(character.scene);

    if (character.animations) {
      this.createAnimations(character);
    }

    callback(character);
    return character;
  }

  protected setCharacterMaterial (character: Assets.GLTF, opacity = 1): void {
    character.traverse(child => {
      const childMesh = child as Mesh;
      const material = childMesh.material as MeshPhongMaterial;

      if (childMesh.isMesh) {
        child.castShadow = true;

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

  private createAnimations (model: Assets.GLTFModel): void {
    const animations = model.animations as Assets.Animations;
    this.mixer = new AnimationMixer(model.scene);

    for (let c = 0; c < animations.length; c++) {
      const clip = camelCase(animations[c].name);
      this.animations[clip] = this.mixer.clipAction(animations[c]);
    }
  }

  private setAnimation (animation: Settings.Animation): void {
    const animations = this.settings.animations as Settings.Animations;

    this.speed.x = animations[animation][0];
    this.speed.z = animations[animation][1];
  }

  protected update (delta: number): void {
    this.mixer?.update(delta);

    if (this.moving && this.character) {
      this.character.translateX(this.speed.x);
      this.character.translateZ(this.speed.z);

      // this.character.position.z = clamp(
      //   this.character.position.z,
      //   -BOUNDS.front,
      //   BOUNDS.front
      // );

      // this.character.position.x = clamp(
      //   this.character.position.x,
      //   -BOUNDS.side,
      //   BOUNDS.side
      // );
    }
  }

  public checkIfAlive (): void {
    if (!this.alive) return;
    this.alive = this.alive && this.health > 0;
    // if (!this.alive) this.death();
  }

  public dispose (): void {
    const children = this.character?.children;

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
      this.character?.remove(children[c]);
    }

    for (const animation in this.animations) {
      this.animations[animation].stopFading();
      this.animations[animation].stop();
      delete this.animations[animation];
    }

    delete this.animations;
    // delete this.colliders;
    delete this.character;
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
}
