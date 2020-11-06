type AnimationAction = import('@three/animation/AnimationAction').AnimationAction;
type GLTFModel = import('@/managers/AssetsLoader').Assets.GLTFModel;
type GLTF = import('@/managers/AssetsLoader').Assets.GLTF;
type Object3D = import('@three/core/Object3D').Object3D;

import { BoxGeometry } from '@three/geometries/BoxGeometry';
import CapsuleGeometry from '@/utils/CapsuleGeometry';
import { SkeletonUtils } from '@utils/SkeletonUtils';

import Character from '@/characters/Character';
import { LoopOnce } from '@three/constants';
import { Mesh } from '@three/objects/Mesh';
import { HitBox } from '@/utils/Material';

import { EnemyAnimations } from '@/types';
import { Config } from '@/config';

export default class Enemy extends Character {
  private lastAnimation: EnemyAnimations = 'Idle';
  private currentAnimation!: AnimationAction;

  private hitBoxes: Array<Object3D> = [];
  private character!: GLTF;
  private head?: Object3D;
  private id: number;

  public constructor (id = 0, model?: GLTFModel) {
    super(Config.Enemy);
    this.id = id;

    if (model !== undefined) {
      this.character = SkeletonUtils.clone(model.scene) as GLTF;
      this.setCharacterMaterial(this.character, 0);
      this.createAnimations(model);
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
    this.setAnimation(this.lastAnimation);

    this.currentAnimation.play();
    this.createHitBoxes();
  }

  private createHitBoxes (): void {
    this.addHeadHitBox();
    this.addBodyHitBox();
    this.addLegsHitBox();
  }

  private addHeadHitBox (): void {
    this.head = this.character.getObjectByName('Head') as Object3D;

    const headHitBox = new Mesh(
      new BoxGeometry(18, 20, 20),
      HitBox.clone()
    );

    headHitBox.position.y += 5;
    headHitBox.position.z += 3;

    headHitBox.userData.enemy = this.id;
    this.hitBoxes.push(headHitBox);
    this.head.add(headHitBox);
  }

  private addBodyHitBox (): void {
    const spine = this.character.getObjectByName('Spine') as Object3D;

    const bodyHitBox = new Mesh(
      new CapsuleGeometry(0.2, 0.95),
      HitBox.clone()
    );

    bodyHitBox.rotation.x -= Math.PI / 2;
    bodyHitBox.position.y += 15;
    bodyHitBox.position.z += 5;

    bodyHitBox.userData.enemy = this.id;
    this.hitBoxes.push(bodyHitBox);
    spine.add(bodyHitBox);
  }

  private addLegsHitBox (): void {
    const rightUpLeg = this.character.getObjectByName('RightUpLeg') as Object3D;
    const leftUpLeg = this.character.getObjectByName('LeftUpLeg') as Object3D;
    const rightLeg = this.character.getObjectByName('RightLeg') as Object3D;
    const leftLeg = this.character.getObjectByName('LeftLeg') as Object3D;

    const upperLeg = new Mesh(
      new BoxGeometry(16, 50, 15),
      HitBox.clone()
    );

    const lowerLeg = new Mesh(
      new BoxGeometry(10, 50, 10),
      HitBox.clone()
    );

    lowerLeg.userData.enemy = this.id;
    upperLeg.userData.enemy = this.id;

    lowerLeg.position.y -= 27.5;
    lowerLeg.position.z -= 2.5;
    upperLeg.position.y -= 20;

    const rightUpLegHitBox = upperLeg.clone();
    const leftUpLegHitBox = upperLeg.clone();
    const rightLegHitBox = lowerLeg.clone();
    const leftLegHitBox = lowerLeg.clone();

    rightUpLegHitBox.position.x += 1;
    leftUpLegHitBox.position.x -= 1;

    this.hitBoxes.push(rightUpLegHitBox);
    this.hitBoxes.push(leftUpLegHitBox);
    this.hitBoxes.push(rightLegHitBox);
    this.hitBoxes.push(leftLegHitBox);

    rightUpLeg.add(rightUpLegHitBox);
    leftUpLeg.add(leftUpLegHitBox);
    rightLeg.add(rightLegHitBox);
    leftLeg.add(leftLegHitBox);
  }

  public update (delta: number): void {
    super.update(delta);

    /* if (this.alive && this.character) {
      this.character.lookAt(this.playerPosition);
    } */
  }

  public get hitBox (): Array<Object3D> {
    return this.hitBoxes;
  }
}
