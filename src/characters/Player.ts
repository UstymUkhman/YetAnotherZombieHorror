type AnimationAction = import('@three/animation/AnimationAction').AnimationAction;
type AudioListener = import('@three/audio/AudioListener').AudioListener;
type ThirtPersonCamera = { position: Vector3, rotation: Vector3 };
type Vector3 = import('@three/math/Vector3').Vector3;

import { Object3D } from '@three/core/Object3D';
import Character from '@/characters/Character';
import { Settings } from '@/settings';

// import Rifle from '@/weapons/Rifle';
import Pistol from '@/weapons/Pistol';
type Weapon = Pistol /* | Rifle */;

export default class Player extends Character {
  private currentAnimation?: AnimationAction;
  private camera?: ThirtPersonCamera;
  private hand?: Object3D;

  private lastAnimation = 'pistolIdle';
  private character = new Object3D();
  private weapon?: Weapon;

  public constructor () {
    super(Settings.Player);
  }

  public async loadCharacter (): Promise<Object3D> {
    const model = (await super.load()).scene;

    this.currentAnimation = this.animations.pistolIdle;
    this.hand = model.getObjectByName('swatRightHand');

    this.currentAnimation.play();
    this.character.add(model);
    return this.character;
  }

  public addSounds (sounds: Array<AudioBuffer>, listener: AudioListener): void {
    sounds.forEach(sound => this.character.add(super.createAudio(sound, listener)));
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
}
