type AnimationAction = import('@three/animation/AnimationAction').AnimationAction;
type Object3D = import('@three/core/Object3D').Object3D;

import Character from '@/characters/Character';
import { Vector3 } from '@three/math/Vector3';
import { Euler } from '@three/math/Euler';
import Camera from '@/managers/Camera';

import { Settings } from '@/settings';
import Pistol from '@/weapons/Pistol';
// import Rifle from '@/weapons/Rifle';
type Weapon = Pistol /* | Rifle */;

export type Location = {
  position: Vector3
  rotation: Euler
};

export class Player extends Character {
  private readonly currentPosition = new Vector3();
  private readonly currentRotation = new Euler();

  private readonly cameraPosition = new Vector3();
  private readonly cameraRotation = new Vector3();

  private currentAnimation?: AnimationAction;
  private lastAnimation = 'pistolIdle';

  private hand?: Object3D;
  private weapon?: Weapon;

  public constructor () {
    super(Settings.Player);
    Camera.setTo(this.object);
  }

  public async loadCharacter (): Promise<Object3D> {
    const model = (await super.load()).scene;

    this.currentAnimation = this.animations.pistolIdle;
    this.hand = model.getObjectByName('swatRightHand');

    this.currentPosition.copy(this.object.position);
    this.currentRotation.copy(this.object.rotation);

    this.currentAnimation.play();
    return this.object;
  }

  public addSounds (sounds: Array<AudioBuffer>): void {
    const listener = Camera.listener;
    sounds.forEach(sound => this.object.add(super.createAudio(sound, listener)));
  }

  public setPistol (pistol: Pistol): void {
    if (!pistol.model) return;

    // this.weapon.targets = colliders;
    this.hand?.add(pistol.model);
    this.weapon = pistol;
  }

  public update (delta: number): void {
    super.update(delta);

    /* if (this.deathCamera) {
      this.cameraRotation.z += 0.005;
    } */
  }

  public get location (): Location {
    return {
      position: this.currentPosition,
      rotation: this.currentRotation
    };
  }

  public get position (): Vector3 {
    return this.currentPosition;
  }

  public get rotation (): Euler {
    return this.currentRotation;
  }
}
