type AnimationAction = import('@three/animation/AnimationAction').AnimationAction;

import { Object3D } from '@three/core/Object3D';
import Character from '@/characters/Character';
import { Vector3 } from '@three/math/Vector3';
import Camera from '@/managers/Camera';

import { Settings } from '@/settings';
import Pistol from '@/weapons/Pistol';
// import Rifle from '@/weapons/Rifle';
type Weapon = Pistol /* | Rifle */;

export default class Player extends Character {
  private readonly cameraPosition = new Vector3();
  private readonly cameraRotation = new Vector3();

  private currentAnimation?: AnimationAction;
  private lastAnimation = 'pistolIdle';
  private character = new Object3D();

  private hand?: Object3D;
  private weapon?: Weapon;

  public constructor () {
    super(Settings.Player);
    Camera.setTo(this.character);
  }

  public async loadCharacter (): Promise<Object3D> {
    const model = (await super.load()).scene;

    this.currentAnimation = this.animations.pistolIdle;
    this.hand = model.getObjectByName('swatRightHand');

    this.currentAnimation.play();
    this.character.add(model);
    return this.character;
  }

  public addSounds (sounds: Array<AudioBuffer>): void {
    const listener = Camera.listener;
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
