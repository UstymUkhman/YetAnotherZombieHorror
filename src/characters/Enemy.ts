import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';

import type { EnemyAnimations } from '@/characters/types';
import type { Texture } from 'three/src/textures/Texture';
import type { Object3D } from 'three/src/core/Object3D';
import type { Vector3 } from 'three/src/math/Vector3';
import type { Assets } from '@/loaders/AssetsLoader';

import { GameEvents } from '@/events/GameEvents';
import { LoopOnce } from 'three/src/constants';
import Character from '@/characters/Character';
import { Mesh } from 'three/src/objects/Mesh';
import { HitBox } from '@/utils/Material';
import Configs from '@/configs';

export default class Enemy extends Character
{
  protected override lastAnimation = 'idle';
  private hitBoxes: Array<Object3D> = [];

  private readonly walkDistance = 400.0;
  // private readonly runDistance = 100.0;
  private character!: Assets.GLTF;

  // private crawling = false;
  private head?: Object3D;
  private id: number;

  public constructor (model?: Assets.GLTFModel, envMap?: Texture, id = 0) {
    super(Configs.Enemy);
    this.id = id;

    if (model && envMap) {
      GameEvents.dispatch('Level::AddObject', this.object);
      this.character = clone(model.scene) as Assets.GLTF;
      this.mesh = this.character;

      this.setMaterial(envMap, 1.0);
      this.setTransform(model);
      this.setDefaultState();
    }
  }

  protected override updateAnimation (animation: EnemyAnimations, action: string, duration = 0.25): NodeJS.Timeout {
    return super.updateAnimation(animation, action, duration);
  }

  public async loadCharacter (envMap?: Texture): Promise<Assets.GLTFModel> {
    return this.load(envMap);
  }

  private walk (): void {
    this.updateAnimation('Walking', 'walk', 0.5);
    this.running = false;
    this.moving = true;
  }

  public override update (delta: number, player?: Vector3): void {
    super.update(delta);
    if (!this.alive) return;

    const playerPosition = player as Vector3;
    const distance = this.object.position.distanceToSquared(playerPosition);
    !this.moving && !this.running && distance < this.walkDistance && this.walk();

    const { x, z } = playerPosition;
    this.character.lookAt(x, 0.0, z);
  }

  public override dispose (): void {
    this.head?.remove(this.hitBoxes[0]);

    for (let box = this.hitBoxes.length; box--;)
      delete this.hitBoxes[box];

    this.character?.clear();
    this.hitBoxes.splice(0);
    super.dispose();
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
    this.currentAnimation.play();
    this.setAnimation('Idle');
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
      new BoxGeometry(15, 10, 22),
      HitBox.clone()
    );

    headHitBox.position.y += 9.5;
    headHitBox.position.z += 2.0;

    headHitBox.userData.enemy = this.id;
    this.hitBoxes.push(headHitBox);
    this.head.add(headHitBox);
  }

  private addBodyHitBox (): void {
    const spine = this.character.getObjectByName('Spine') as Object3D;

    const bodyHitBox = new Mesh(
      new RoundedBoxGeometry(38, 95, 40, 2, 25),
      HitBox.clone()
    );

    bodyHitBox.position.y += 15.0;
    bodyHitBox.position.z += 2.5;
    bodyHitBox.position.x -= 1.0;

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

    lowerLeg.position.y -= 22.5;
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

  public get hitBox (): Array<Object3D> {
    return this.hitBoxes;
  }
}
