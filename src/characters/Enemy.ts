import type { CharacterSound, EnemyAnimations, EnemyDeathAnimation } from '@/characters/types';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import type { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';

import type { SkinnedMesh } from 'three/src/objects/SkinnedMesh';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';

import type { Texture } from 'three/src/textures/Texture';
import type { Object3D } from 'three/src/core/Object3D';
import type { Vector3 } from 'three/src/math/Vector3';
import type { Assets } from '@/loaders/AssetsLoader';
import { GameEvents } from '@/events/GameEvents';

import { LoopOnce } from 'three/src/constants';
import Character from '@/characters/Character';
import { Mesh } from 'three/src/objects/Mesh';
import type { AnimeInstance } from 'animejs';
import { Material } from '@/utils/Material';

import Configs from '@/configs';
import anime from 'animejs';

// Game Difficulty Settings:
// const ATTACK_IMMUNE = false; // Immune while attacking
const CAN_LOSE = true; // Pass to walk/idle animation after screaming

export default class Enemy extends Character
{
  private readonly onLegHit = this.crawl.bind(this);

  protected override animationUpdate = true;
  protected override lastAnimation = 'idle';
  private crawlAnimation?: AnimeInstance;
  private hitBoxes: Array<Object3D> = [];

  private hittingTimeout!: NodeJS.Timeout;
  private attackTimeout!: NodeJS.Timeout;
  private crawlTimeout!: NodeJS.Timeout;

  private readonly attackDistance = 2.5;
  private readonly walkDistance = 500.0;
  private readonly runDistance = 250.0;

  private animTimeout!: NodeJS.Timeout;
  private runTimeout!: NodeJS.Timeout;
  private hitTimeout!: NodeJS.Timeout;

  private previousAnimation = 'idle';
  private character!: Assets.GLTF;

  private screamDuration!: number;
  private screamStart!: number;
  private hitDuration!: number;
  private distance = Infinity;
  private hitStart!: number;

  private attacking = false;
  private screaming = false;
  private screamed = false;

  private crawling = false;
  private falling = false;
  private visible = false;

  private crawlTime = 0.0;
  private fallTime = 0.0;
  private hitTime = 0.0;

  public constructor (model?: Assets.GLTFModel, envMap?: Texture, private readonly id = 0) {
    super(Configs.Enemy);

    if (model && envMap) {
      GameEvents.dispatch('Enemy::Create', this.uuid, true);
      GameEvents.dispatch('Level::AddObject', this.object);
      this.character = clone(model.scene) as Assets.GLTF;

      const opacity = +!this.id;
      this.mesh = this.character;
      this.setMaterial(envMap, opacity);

      this.setTransform(model);
      this.setDefaultState();
      this.toggleVisibility(true);
    }
  }

  protected override updateAnimation (animation: EnemyAnimations, action: string, duration = 0.5): NodeJS.Timeout {
    return super.updateAnimation(animation, action, duration);
  }

  private toggleVisibility (show: boolean, death?: EnemyDeathAnimation): void {
    if (!this.hitBoxes.length) return;

    const duration = 1000.0 + +!show * 1500.0;
    const easing = show ? 'easeInQuad' : 'easeOutQuad';
    const delay = death && this.getAnimationDuration(death) + 500 || 0;

    if (show) this.visible = true;

    else {
      this.cancelHit();
      this.removeHitBoxes();

      clearTimeout(this.crawlTimeout);
      const timeout = delay + duration;

      const crawling = death === 'crawlDeath';
      setTimeout(this.dispose.bind(this), timeout);

      const inPlace = Date.now() - this.crawlTime < 3e3;
      crawling && inPlace && this.animations.crawling.stop();

      this.animations.idle.stopFading();
      this.animations.walk.stopFading();
      this.animations.run.stopFading();

      this.animations.idle.stop();
      this.animations.walk.stop();
      this.animations.run.stop();
    }

    setTimeout(() => {
      GameEvents.dispatch('Enemy::Active', show, true);
      this.animationUpdate = false;
    }, +show * duration);

    anime({
      targets: this.material,
      opacity: +show,
      duration,
      easing,
      delay
    });
  }

  public async loadCharacter (envMap?: Texture): Promise<Assets.GLTFModel> {
    return this.load(envMap);
  }

  private fallDeadAnimation (animation: EnemyDeathAnimation): void {
    const fallBack = Date.now() - this.fallTime < 1500;
    const deathAnimation = this.falling && fallBack;

    deathAnimation && this.updateAnimation('Idle', animation);
    this.toggleVisibility(false, animation);
  }

  public headHit (damage: number, kill: boolean): void {
    if (this.dead) return;
    this.cancelAnimation();

    this.hitting && this.cancelHit();

    if (!kill && this.life > damage) {
      return this.bodyHit(damage);
    }

    if (!this.updateHitDamage(damage)) {
      this.toggleVisibility(false, 'headshot');
      this.updateAnimation('Idle', 'headshot');
    }

    else if (this.falling)
      this.fallDeadAnimation('headshot');

    this.hitTime = Date.now();
    this.running = false;
  }

  public bodyHit (damage: number): void {
    if (this.dead) return;
    this.cancelAnimation();

    if (this.updateHitDamage(damage)) {
      this.dead && this.fallDeadAnimation('death');
      return;
    }

    if (this.dead) {
      this.toggleVisibility(false, 'death');
      this.updateAnimation('Idle', 'death');
      return;
    }

    else if (!this.hitting)
      this.previousAnimation = this.lastAnimation;

    else {
      this.cancelHit();
      this.animations.idle.play();
      this.currentAnimation = this.animations.idle;

      const prevRun = this.previousAnimation === 'run';
      const lastRun = this.lastAnimation === 'run';

      if (this.hitting && this.running && prevRun && lastRun) {
        if (this.updateHitDamage(this.life)) {
          return this.fallDeadAnimation('death');
        }

        this.toggleVisibility(false, 'death');
        this.updateAnimation('Idle', 'death');

        return;
      }
    }

    if (this.previousAnimation !== 'hit') {
      this.animations.hit.time = this.hitStart;
      this.updateAnimation('Idle', 'hit', 0.15);
    }

    this.hitTimeout = setTimeout(() => {
      if (this.dead || this.attacking) return;

      const attacking = this.previousAnimation.includes('Attack');
      const screaming = this.previousAnimation === 'scream';
      const blockingAnimation = attacking || screaming;

      if (!blockingAnimation) this.animTimeout = this.updateAnimation(
        animation, this.previousAnimation, 0.15
      );

      this.hitTimeout = setTimeout(() => {
        if (this.dead) return;
        this.hitting = false;

        const attack  = this.distance < this.attackDistance;
        const running = this.distance < this.runDistance;
        const hit     = this.previousAnimation === 'hit';
        const run     = running && !this.running;

             if (attack)     this.attack();
        else if (hit || run) this.run();
      }, +!blockingAnimation * 150);
    }, this.hitDuration - 150);

    const animation = this.animation;
    this.hitTime = Date.now();
    this.hitting = true;
  }

  public legHit (damage: number): NodeJS.Timeout | void {
    if (this.dead) return;
    this.cancelAnimation();

    const now = Date.now();
    const delay = now - this.hitTime;
    const lyingDown = this.updateHitDamage(damage);

    if (delay < 825 && delay > 600) return setTimeout(
      this.legHit.bind(this, damage), 825 - delay
    );

    this.hitting && this.cancelHit();

    if (lyingDown) {
      this.dead && this.falling &&
        this.toggleVisibility(false, 'crawlDeath');

      return;
    }

    this.crawlTimeout = setTimeout(this.onLegHit, 2500.0);
    this.updateAnimation('Falling', 'falling', 0.1);
    this.hitTime = this.fallTime = now;
    this.playSound('hit', true);

    this.running = false;
    this.falling = true;
    this.hitting = true;
    this.moving = false;
  }

  private crawl (duration = 3.0): void {
    if (this.dead) return;
    this.crawlTime = Date.now();
    this.crawlTimeout = this.updateAnimation('Crawling', 'crawling', duration);

    if (!this.crawling) this.crawlAnimation = anime({
      z: this.rotation.z * (duration * -0.1),
      targets: this.character.position,
      duration: duration * 1e3,
      easing: 'linear'
    });

    this.attacking = false;
    this.crawling = true;

    this.falling = false;
    this.hitting = false;
    this.moving = true;
  }

  private cancelAnimation (): void {
    if (this.attacking) {
      this.animations.softAttack.stopFading();
      this.animations.hardAttack.stopFading();
      this.animations.softAttack.stop();
      this.animations.hardAttack.stop();

      clearTimeout(this.hittingTimeout);
      clearTimeout(this.attackTimeout);
      clearTimeout(this.animTimeout);
      this.attacking = false;
    }

    if (this.screaming) {
      this.animations.scream.stopFading();
      clearTimeout(this.animTimeout);
      clearTimeout(this.runTimeout);

      this.animations.scream.stop();
      this.screaming = false;
    }
  }

  private cancelHit (): void {
    this.animations.hit.stopFading();
    clearTimeout(this.animTimeout);
    clearTimeout(this.hitTimeout);
    this.animations.hit.stop();
  }

  private idle (): void {
    if (this.dead) return;

    const duration = +!this.attacking * 0.4 + 0.1;
    this.updateAnimation('Idle', 'idle', duration);

    this.attacking = false;
    this.hitting = false;

    this.running = false;
    this.moving = false;
  }

  private walk (): void {
    if (this.dead) return;
    this.updateAnimation('Walking', 'walk');

    this.hitting = false;
    this.running = false;
    this.moving = true;
  }

  private scream (): void {
    if (this.dead) return;
    this.cancelHit();

    this.moving = false;
    this.hitting = false;
    this.screamed = true;
    this.screaming = true;
    this.attacking = false;

    this.runTimeout = setTimeout(() => {
      this.playSound('scream', true);
      const delay = this.screamDuration - 250;

      this.runTimeout = setTimeout(() =>
        this.distance < this.attackDistance
          ? this.attack() : this.run()
      , delay);
    }, this.screamStart * 1e3);

    this.animTimeout = this.updateAnimation('Idle', 'scream', this.screamStart);
  }

  private run (): void {
    if (this.dead) return;

    const slow = +(this.attacking || this.screaming) * 0.1;
    this.updateAnimation('Running', 'run', slow + 0.1);

    this.attacking = false;
    this.screaming = false;

    this.hitting = false;
    this.running = true;
    this.moving = true;
  }

  private attack (): void {
    if (this.dead) return;

    const hard = this.life > 50.0 && Math.random() < 0.5;
    let attack = 'crawlAttack', duration = 0.5,
      delay = 2200.0, hitDelay = 250.0;

    if (!this.crawling) {
      attack = hard ? 'hardAttack' : 'softAttack';
      hitDelay = hard ? 1300.0 : 1000.0;
      delay = hard ? 3000.0 : 2500.0;

      setTimeout(this.playSound.bind(
        this, attack as CharacterSound, true
      ), +!hard * 350.0 + 400.0);

      duration = 0.166;
    }

    this.updateAnimation('Idle', attack, duration);

    this.hittingTimeout = setTimeout(() =>
      this.canAttack && GameEvents.dispatch(
        'Enemy::Attack', this.position
      )
    , hitDelay);

    this.attackTimeout = setTimeout(() => {
      if (this.dead) return;

      const attack = this.distance < (
        this.crawling ? 1.5 : this.attackDistance
      );

      this.crawling ? this.crawl(+attack + 1.0)
        : attack ? this.idle() : this.run();
    }, duration * 1e3 + delay);

    this.screaming = false;
    this.attacking = true;

    this.screamed = true;
    this.hitting = false;

    this.running = false;
    this.moving = false;
  }

  public override update (delta: number, player?: Vector3): void {
    const playerPosition = player as Vector3;
    if (!this.visible) return;

    super.update(delta);
    if (this.dead) return;

    this.distance = this.object.position.distanceToSquared(playerPosition);
    this.character.lookAt(playerPosition.x, 0.0, playerPosition.z);
    this.toggleAnimation();
  }

  private updateHitDamage (damage: number): boolean {
    const lyingDown = this.falling || this.crawling;
    const dead = this.updateHealth(damage);
    if (!lyingDown) return false;

    if (!dead) this.playSound('hit', true);

    else if (this.crawling) {
      let duration = undefined;

      if (!this.crawlAnimation?.completed) {
        this.character.position.z = this.rotation.z;
        this.crawlAnimation?.pause();

        this.animations.falling
          .setEffectiveTimeScale(1.0)
          .setEffectiveWeight(1.0)
          .stopWarping()
          .stopFading();

        duration = 0.0;
      }

      this.toggleVisibility(false, 'crawlDeath');
      this.updateAnimation('Idle', 'crawlDeath', duration);
    }

    return true;
  }

  private toggleAnimation (): void {
    if (this.blockingAnimation) return;
    if (this.canAttack) return this.attack();
    if (this.crawling || (!CAN_LOSE && this.running)) return;

    const idleAnimation   = this.distance   > this.walkDistance;
    const screamAnimation = this.distance   < this.runDistance;
    const walkAnimation   = !idleAnimation && !screamAnimation;
    const scream          = !this.screamed && screamAnimation;

         if (CAN_LOSE && this.moving && idleAnimation) this.idle();
    else if (!this.moving && walkAnimation)            this.walk();
    else if (!(CAN_LOSE && this.running) && scream)    this.scream();
  }

  public override dispose (): void {
    super.dispose();
    this.removeHitBoxes();
    this.character?.clear();

    GameEvents.dispatch('Enemy::Death', this.id, true);
    GameEvents.dispatch('Enemy::Dispose', this.uuid, true);
    GameEvents.dispatch('Level::RemoveObject', this.object);
  }

  private setDefaultState (): void {
    const screamDuration = this.getAnimationDuration('scream');
    this.screamDuration = screamDuration - 333.3332538604736 | 0;
    this.screamStart = (screamDuration - this.screamDuration) / 1000;

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
      Material.HitBox.clone()
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
      Material.HitBox.clone()
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
      Material.HitBox.clone()
    );

    const lowerLeg = new Mesh(
      new BoxGeometry(10, 50, 10),
      Material.HitBox.clone()
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

  protected override get blockingAnimation (): boolean {
    return this.attacking || this.falling || this.screaming || super.blockingAnimation;
  }

  private get material (): MeshStandardMaterial {
    return (this.mesh.children[0].children[1] as SkinnedMesh).material as MeshStandardMaterial;
  }

  private get animation (): EnemyAnimations {
    const direction = this.running ? 'Running' : this.moving ? 'Walking' : 'Idle';
    return this.falling ? 'Falling' : this.crawling ? 'Crawling' : direction;
  }

  public get hitBox (): Array<Object3D> {
    return this.hitBoxes;
  }

  private get canAttack (): boolean {
    return this.distance < (this.crawling ? 1.5 : this.attackDistance);
  }

  public get index (): number {
    return this.id;
  }
}
