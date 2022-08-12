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
import anime from 'animejs';

export default class Enemy extends Character
{
  private readonly onLegHit = this.crawl.bind(this);
  protected override lastAnimation = 'idle';
  private hitBoxes: Array<Object3D> = [];

  private readonly walkDistance = 400.0;
  // private readonly runDistance = 100.0;

  private animTimeout!: NodeJS.Timeout;
  private hitFadeOut!: NodeJS.Timeout;
  private hitTimeout!: NodeJS.Timeout;

  private previousAnimation = 'idle';
  private character!: Assets.GLTF;

  private hitDuration!: number;
  private hitStart!: number;

  private screaming = false;
  private attacking = false;
  private crawling = false;
  private falling = false;

  public constructor (model?: Assets.GLTFModel, envMap?: Texture, private readonly id = 0) {
    super(Configs.Enemy);

    if (model && envMap) {
      GameEvents.dispatch('Enemy::Create', this.uuid, true);
      GameEvents.dispatch('Level::AddObject', this.object);
      this.character = clone(model.scene) as Assets.GLTF;
      this.mesh = this.character;

      this.setMaterial(envMap, 1.0);
      this.setTransform(model);
      this.setDefaultState();
    }
  }

  protected override updateAnimation (animation: EnemyAnimations, action: string, duration = 0.5): NodeJS.Timeout {
    return super.updateAnimation(animation, action, duration);
  }

  public async loadCharacter (envMap?: Texture): Promise<Assets.GLTFModel> {
    return this.load(envMap);
  }

  private toggleAnimation (player: Vector3): void {
    const distance = this.object.position.distanceToSquared(player);

    if (this.screaming || this.attacking || this.crawling || this.falling) return;

    else if (this.moving && distance > this.walkDistance) {
      this.idle();
    }

    else if (!this.moving && distance < this.walkDistance) {
      this.walk();
    }
  }

  private cancelHit (): void {
    this.animations.hit.stopFading();
    clearTimeout(this.animTimeout);
    clearTimeout(this.hitFadeOut);
    clearTimeout(this.hitTimeout);
    this.animations.hit.stop();
  }

  public headHit (): void {
    if (this.dead) return;
    this.hitting && this.cancelHit();
    // if (!HEADSHOT_KILL) return this.bodyHit();

    !this.updateHitDamage(100.0) &&
      this.updateAnimation('Idle', 'headshot');

    this.screaming = false;
    this.attacking = false;

    this.crawling = false;
    this.falling = false;
  }

  public bodyHit (): void {
    if (this.dead) return;

    if (this.updateHitDamage(100.0)) {
      this.dead && this.falling &&
        this.updateAnimation('Idle', 'death');

      return;
    }

    if (this.dead)
      return this.updateAnimation('Idle', 'death') as unknown as void;

    else if (!this.hitting)
      this.previousAnimation = this.lastAnimation;

    else {
      this.currentAnimation = this.animations.idle;
      this.currentAnimation.play();
      this.cancelHit();
    }

    this.animations.hit.time = this.hitStart;
    this.updateAnimation('Idle', 'hit', 0.1);

    this.hitFadeOut = setTimeout(() => {
      this.animTimeout = this.updateAnimation(
        animation, this.previousAnimation, 0.2
      );
    }, this.hitDuration - 200);

    this.hitTimeout = setTimeout(() => {
      this.hitting = false;
    }, this.hitDuration);

    const animation = this.animation;
    this.hitting = true;
  }

  public legHit (): void {
    if (this.dead) return;
    this.hitting && this.cancelHit();
    if (this.updateHitDamage(100.0)) return;

    this.updateAnimation('Falling', 'falling', 0.1);
    setTimeout(this.onLegHit, 2500);
    this.playSound('hit', true);

    this.screaming = false;
    this.attacking = false;

    this.crawling = false;
    this.running = false;
    this.falling = true;

    this.hitting = true;
    this.moving = false;
  }

  private crawl (): void {
    if (this.dead) return;
    this.updateAnimation('Crawling', 'crawling', 3.0);

    anime({
      targets: this.character.position,
      z: this.rotation.z * -0.3,
      easing: 'linear',
      duration: 3e3
    });

    this.crawling = true;
    this.falling = false;
    this.hitting = false;
    this.moving = true;
  }

  private idle (): void {
    this.updateAnimation('Idle', 'idle');
    this.hitting = false;
    this.moving = false;
  }

  private walk (): void {
    // if (this.running) return;
    this.updateAnimation('Walking', 'walk');

    this.hitting = false;
    this.moving = true;
  }

  public override update (delta: number, player?: Vector3): void {
    super.update(delta);
    if (this.dead) return;

    const playerPosition = player as Vector3;
    this.toggleAnimation(playerPosition);

    const { x, z } = playerPosition;
    this.character.lookAt(x, 0.0, z);
  }

  private updateHitDamage (damage: number): boolean {
    const lyingDown = this.crawling || this.falling;
    const dead = this.updateHealth(damage);
    dead && this.removeHitBoxes();

    if (lyingDown) dead
      ? this.crawling && this.updateAnimation('Idle', 'crawlDeath')
      : this.playSound('hit', true);

    return lyingDown;
  }

  public override dispose (): void {
    GameEvents.dispatch('Enemy::Dispose', this.uuid, true);
    this.character?.clear();
    this.removeHitBoxes();
    super.dispose();
  }

  private setDefaultState (): void {
    const hitDuration = this.getAnimationDuration('hit');
    this.hitDuration = hitDuration - 233.3333015441895 | 0;
    this.hitStart = (hitDuration - this.hitDuration) / 1000;

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

    const { idle } = this.animations;
    this.currentAnimation = idle;
    this.createHitBoxes();
    idle.play();
  }

  private createHitBoxes (): void {
    this.addHeadHitBox();
    this.addBodyHitBox();
    this.addLegsHitBox();
  }

  private removeHitBoxes (): void {
    for (let box = this.hitBoxes.length; box--;)
      delete this.hitBoxes[box];

    this.hitBoxes.splice(0);
  }

  private addHeadHitBox (): void {
    const head = this.character.getObjectByName('Head') as Object3D;

    const headHitBox = new Mesh(
      new BoxGeometry(15, 10, 22),
      HitBox.clone()
    );

    headHitBox.position.y += 9.5;
    headHitBox.position.z += 2.0;

    headHitBox.userData.enemy = this.id;
    this.hitBoxes.push(headHitBox);
    head.add(headHitBox);
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

  private get animation (): EnemyAnimations {
    const direction = this.running ? 'Running' : this.moving ? 'Walking' : 'Idle';
    return this.falling ? 'Falling' : this.crawling ? 'Crawling' : direction;
  }

  public get hitBox (): Array<Object3D> {
    return this.hitBoxes;
  }
}
