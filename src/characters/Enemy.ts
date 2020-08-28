type AnimationAction = import('@three/animation/AnimationAction').AnimationAction;
type AudioListener = import('@three/audio/AudioListener').AudioListener;
type GLTFModel = import('@/managers/AssetsLoader').Assets.GLTFModel;
type GLTF = import('@/managers/AssetsLoader').Assets.GLTF;
type Object3D = import('@three/core/Object3D').Object3D;

import { BoxGeometry } from '@three/geometries/BoxGeometry';
import CapsuleGeometry from '@/utils/CapsuleGeometry';
import { SkeletonUtils } from '@utils/SkeletonUtils';

import { HitBoxMaterial } from '@/utils/Material';
import Character from '@/characters/Character';
import { LoopOnce } from '@three/constants';
import { Mesh } from '@three/objects/Mesh';
import { Settings } from '@/settings';

export default class Enemy extends Character {
  private lastAnimation: Settings.EnemyAnimations = 'Idle';
  private currentAnimation!: AnimationAction;

  private colliders: Array<Mesh> = [];
  private character!: GLTF;
  private head?: Object3D;
  private id: number;

  public constructor (id = 0, model?: GLTFModel) {
    super(Settings.Enemy);
    this.id = id;

    if (model !== undefined) {
      this.character = SkeletonUtils.clone(model.scene) as GLTF;
      super.setCharacterMaterial(this.character, 0);
      super.createAnimations(model);
      this.setDefaultState();
    }
  }

  private setDefaultState (): void {
    this.animations.softAttack.clampWhenFinished = true;
    this.animations.hardAttack.clampWhenFinished = true;

    this.animations.crawlDeath.clampWhenFinished = true;
    this.animations.headshot.clampWhenFinished = true;
    this.animations.death.clampWhenFinished = true;

    this.animations.falling.clampWhenFinished = true;
    this.animations.scream.clampWhenFinished = true;
    this.animations.hit.clampWhenFinished = true;

    this.animations.softAttack.setLoop(LoopOnce, 0);
    this.animations.hardAttack.setLoop(LoopOnce, 0);

    this.animations.crawlDeath.setLoop(LoopOnce, 0);
    this.animations.headshot.setLoop(LoopOnce, 0);
    this.animations.death.setLoop(LoopOnce, 0);

    this.animations.falling.setLoop(LoopOnce, 0);
    this.animations.scream.setLoop(LoopOnce, 0);
    this.animations.hit.setLoop(LoopOnce, 0);

    this.currentAnimation = this.animations.idle;
    super.setAnimation(this.lastAnimation);

    this.currentAnimation.play();
    this.createColliders();
  }

  private createColliders (): void {
    this.addHeadCollider();
    this.addBodyCollider();
    this.addLegsCollider();
  }

  private addHeadCollider (): void {
    this.head = this.character.getObjectByName('Head') as Object3D;

    const headCollider = new Mesh(
      new BoxGeometry(18, 20, 20),
      HitBoxMaterial.clone()
    );

    headCollider.position.y += 5;
    headCollider.position.z += 3;

    headCollider.userData.enemy = this.id;
    this.colliders.push(headCollider);
    this.head.add(headCollider);
  }

  private addBodyCollider (): void {
    const spine = this.character.getObjectByName('Spine') as Object3D;

    const bodyCollider = new Mesh(
      CapsuleGeometry(20, 50),
      HitBoxMaterial.clone()
    );

    bodyCollider.rotation.x -= Math.PI / 2;
    bodyCollider.position.y += 15;
    bodyCollider.position.z += 5;

    bodyCollider.userData.enemy = this.id;
    this.colliders.push(bodyCollider);
    spine.add(bodyCollider);
  }

  private addLegsCollider (): void {
    const rightUpLeg = this.character.getObjectByName('RightUpLeg') as Object3D;
    const leftUpLeg = this.character.getObjectByName('LeftUpLeg') as Object3D;
    const rightLeg = this.character.getObjectByName('RightLeg') as Object3D;
    const leftLeg = this.character.getObjectByName('LeftLeg') as Object3D;

    const upperLeg = new Mesh(
      new BoxGeometry(16, 50, 15),
      HitBoxMaterial.clone()
    );

    const lowerLeg = new Mesh(
      new BoxGeometry(10, 50, 10),
      HitBoxMaterial.clone()
    );

    lowerLeg.userData.enemy = this.id;
    upperLeg.userData.enemy = this.id;

    lowerLeg.position.y -= 27.5;
    lowerLeg.position.z -= 2.5;
    upperLeg.position.y -= 20;

    const rightUpLegCollider = upperLeg.clone();
    const leftUpLegCollider = upperLeg.clone();
    const rightLegCollider = lowerLeg.clone();
    const leftLegCollider = lowerLeg.clone();

    rightUpLegCollider.position.x += 1;
    leftUpLegCollider.position.x -= 1;

    this.colliders.push(rightUpLegCollider);
    this.colliders.push(leftUpLegCollider);
    this.colliders.push(rightLegCollider);
    this.colliders.push(leftLegCollider);

    rightUpLeg.add(rightUpLegCollider);
    leftUpLeg.add(leftUpLegCollider);
    rightLeg.add(rightLegCollider);
    leftLeg.add(leftLegCollider);
  }

  public addSounds (sounds: Array<AudioBuffer>, listener: AudioListener): void {
    sounds.forEach(sound => this.character.add(super.createAudio(sound, listener)));
  }

  public update (delta: number): void {
    super.update(delta);

    /* if (super.alive && super.character) {
      super.character.lookAt(this.playerPosition);
    } */
  }
}
