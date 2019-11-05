import { MeshBasicMaterial } from '@three/materials/MeshBasicMaterial';
import { AnimationMixer } from '@three/animation/AnimationMixer';
import { BoxGeometry } from '@three/geometries/BoxGeometry';
import CapsuleGeometry from '@/utils/CapsuleGeometry';

import config from '@/assets/characters/enemy.json';
import ZOMBIE from '@/assets/characters/enemy.glb';

import Character from '@/characters/Character';
import { Vector3 } from '@three/math/Vector3';
import { LoopOnce } from '@three/constants';
import { Mesh } from '@three/objects/Mesh';

const colliderMaterial = new MeshBasicMaterial({
  // transparent: true,
  // color: 0xFF0000,
  // opacity: 0.5,
  visible: false
});

export default class Enemy extends Character {
  constructor (character, animations, onLoad) {
    if (character) {
      super('', config);
      this._setDefaultState(character, animations, onLoad);
    } else {
      super(
        ZOMBIE, config, (character, animations) =>
          this._setDefaultState(character, animations, onLoad)
      );
    }

    this.playerPosition = new Vector3();
    this.visiblePlayer = false;
    this.nextToPlayer = false;
    this.crawlTimeout = null;

    this.gettingHit = false;
    this.attacking = false;
    this.crawling = false;
    this.running = false;
    this.moving = false;
  }

  _setDefaultState (character, animations, onLoad) {
    this.mixer = new AnimationMixer(character);
    this.createAnimations(animations);

    this.animations.softAttack.clampWhenFinished = true;
    this.animations.hardAttack.clampWhenFinished = true;

    this.animations.crawlDeath.clampWhenFinished = true;
    this.animations.headshot.clampWhenFinished = true;
    this.animations.death.clampWhenFinished = true;

    this.animations.falling.clampWhenFinished = true;
    this.animations.scream.clampWhenFinished = true;
    this.animations.hit.clampWhenFinished = true;

    this.animations.softAttack.setLoop(LoopOnce);
    this.animations.hardAttack.setLoop(LoopOnce);

    this.animations.crawlDeath.setLoop(LoopOnce);
    this.animations.headshot.setLoop(LoopOnce);
    this.animations.death.setLoop(LoopOnce);

    this.animations.falling.setLoop(LoopOnce);
    this.animations.scream.setLoop(LoopOnce);
    this.animations.hit.setLoop(LoopOnce);

    // console.log(this.animations);

    this.currentAnimation = this.animations.idle;
    this.currentAnimation.play();
    this.lastAnimation = 'idle';
    this.character = character;
    this.colliders = [];

    this._addHeadCollider(character);
    this._addBodyCollider(character);
    this._addLegsCollider(character);

    if (onLoad) {
      onLoad(character, animations);
    }
  }

  _addHeadCollider (character) {
    const head = character.getObjectByName('Head');

    const headCollider = new Mesh(
      new BoxGeometry(20, 25, 25),
      colliderMaterial.clone()
    );

    this.colliders.push(headCollider);
    headCollider.position.y += 5;
    head.add(headCollider);
  }

  _addBodyCollider (character) {
    const spine = character.getObjectByName('Spine');

    const bodyCollider = new Mesh(
      CapsuleGeometry(20, 50),
      colliderMaterial.clone()
    );

    bodyCollider.rotation.x -= Math.PI / 2;
    bodyCollider.position.y += 12.5;
    bodyCollider.position.z += 2.5;

    this.colliders.push(bodyCollider);
    spine.add(bodyCollider);
  }

  _addLegsCollider (character) {
    const rightUpLeg = character.getObjectByName('RightUpLeg');
    const leftUpLeg = character.getObjectByName('LeftUpLeg');
    const rightLeg = character.getObjectByName('RightLeg');
    const leftLeg = character.getObjectByName('LeftLeg');

    const upperLeg = new Mesh(
      new BoxGeometry(15, 50, 15),
      colliderMaterial.clone()
    );

    const lowerLeg = new Mesh(
      new BoxGeometry(10, 50, 10),
      colliderMaterial.clone()
    );

    lowerLeg.position.y -= 27.5;
    upperLeg.position.y -= 20;

    const rightUpLegCollider = upperLeg.clone();
    const leftUpLegCollider = upperLeg.clone();
    const rightLegCollider = lowerLeg.clone();
    const leftLegCollider = lowerLeg.clone();

    this.colliders.push(rightUpLegCollider);
    this.colliders.push(leftUpLegCollider);
    this.colliders.push(rightLegCollider);
    this.colliders.push(leftLegCollider);

    rightUpLeg.add(rightUpLegCollider);
    leftUpLeg.add(leftUpLegCollider);
    rightLeg.add(rightLegCollider);
    leftLeg.add(leftLegCollider);
  }

  idle () {
    if (!this.alive) return;

    this.currentAnimation.crossFadeTo(this.animations.idle, 0.25, true);
    this.animations.idle.play();

    setTimeout(() => {
      this.moving = false;
      this.running = false;
      this.attacking = false;

      this.lastAnimation = 'idle';
      this.currentAnimation.stop();

      this.setDirection('Idle');
      this.currentAnimation = this.animations.idle;
    }, 250);
  }

  walk () {
    if (!this.alive) return;

    this.currentAnimation.crossFadeTo(this.animations.walk, 0.25, true);
    this.animations.walk.play();

    setTimeout(() => {
      this.moving = true;
      this.running = false;
      this.attacking = false;

      this.lastAnimation = 'walk';
      this.currentAnimation.stop();

      this.setDirection('Walking');
      this.currentAnimation = this.animations.walk;
    }, 250);
  }

  scream (run = true) {
    this.currentAnimation.crossFadeTo(this.animations.scream, 0.233, true);
    this.animations.scream.play();

    this.attacking = false;
    this.running = false;
    this.moving = false;

    setTimeout(() => {
      this.currentAnimation.stop();
      this.lastAnimation = 'scream';
      this.currentAnimation = this.animations.scream;

      setTimeout(() => {
        if (run && !this.crawling) this.run();
      }, 2400);
    }, 233);
  }

  run () {
    this.currentAnimation.crossFadeTo(this.animations.run, 0.25, true);
    this.animations.run.play();

    setTimeout(() => {
      this.moving = true;
      this.running = true;
      this.attacking = false;

      this.lastAnimation = 'run';
      this.currentAnimation.stop();

      this.setDirection('Running');
      this.currentAnimation = this.animations.run;
    }, 250);
  }

  attack (hard = false) {
    const attack = this.crawling ? 'crawlAttack' : hard ? 'hardAttack' : 'softAttack';
    const lastAnimation = this.crawling ? 'crawl' : this.lastAnimation;
    const delay = this.crawling ? 2200 : hard ? 4400 : 2500;

    this.currentAnimation.crossFadeTo(this.animations[attack], 0.166, true);
    this.animations[attack].play();

    this.attacking = true;
    this.running = false;
    this.moving = false;

    setTimeout(() => {
      this.lastAnimation = attack;
      this.currentAnimation.stop();

      this.currentAnimation = this.animations[attack];
      setTimeout(() => { this[lastAnimation](); }, delay);
    }, 166);
  }

  bodyHit (amount) {
    this.health -= amount;
    this._checkIfAlive();

    if (this.alive && !this.crawling && !this.gettingHit) {
      const setIdle = this.moving || this.running;
      const lastAnimation = this.lastAnimation;
      const direction = this._direction;

      if (!setIdle) {
        this.animations.hit.fadeIn(0.1);
      } else {
        this.currentAnimation.crossFadeTo(this.animations.hit, 0.1, true);
        this.setDirection('Idle');

        setTimeout(() => {
          this.lastAnimation = 'hit';
          this.currentAnimation.stop();
          this.currentAnimation = this.animations.hit;
        }, 100);
      }

      this.animations.hit.play();
      this.gettingHit = true;

      setTimeout(() => {
        this.animations.hit.fadeOut(0.25);
      }, 750);

      setTimeout(() => {
        this.animations.hit.stop();
        this.gettingHit = false;

        if (setIdle) {
          this.setDirection(direction);
          this[lastAnimation]();
        }
      }, 1000);
    }

    return this.alive;
  }

  legHit (amount) {
    this.health -= amount;
    this._checkIfAlive();

    if (this.alive && !this.crawling) {
      this.currentAnimation.crossFadeTo(this.animations.falling, 0.1, true);
      this.animations.falling.play();
      this.gettingHit = true;

      setTimeout(() => {
        this.moving = true;
        this.crawling = true;

        this.running = false;
        this.attacking = false;

        this.setDirection('Idle');
        this.currentAnimation.stop();
        this.lastAnimation = 'legHit';

        setTimeout(() => { this.gettingHit = false; }, 1500);
        this.currentAnimation = this.animations.falling;
        setTimeout(this.crawl.bind(this), 2800);
      }, 100);
    }

    return this.alive;
  }

  crawl () {
    if (!this.alive) return;

    this.currentAnimation.crossFadeTo(this.animations.crawling, 3, true);
    this.animations.crawling.play();
    this.setDirection('Falling');

    this.gettingHit = false;
    this.attacking = false;
    this.crawling = true;
    this.running = false;
    this.moving = true;

    this.crawlTimeout = setTimeout(() => {
      this.lastAnimation = 'crawl';
      this.setDirection('Crawling');
      this.currentAnimation = this.animations.crawling;
    }, 3000);
  }

  _checkIfAlive () {
    this.alive = this.alive && this.health > 0;
    if (!this.alive) this.death();
  }

  death () {
    const death = this.crawling ? 'crawlDeath' : 'death';
    this.currentAnimation.crossFadeTo(this.animations[death], 0.133, true);
    this.animations[death].play();

    this.alive = false;
    this.health = 0;

    setTimeout(() => {
      this.moving = false;
      this.running = false;
      this.attacking = false;

      this.setDirection('Idle');
      this.lastAnimation = 'death';
      this.currentAnimation.stop();
      this.currentAnimation = this.animations[death];
    }, 133);
  }

  headshot () {
    if (!this.alive) return;
    const crawling = this.crawling && !this.gettingHit;
    const death = crawling ? 'crawlDeath' : 'headshot';

    if (crawling && this.lastAnimation !== 'crawl') {
      this.animations.crawling.stopFading();
      this.currentAnimation.stopFading();
      this.animations.crawling.stop();
      clearTimeout(this.crawlTimeout);
    }

    this.currentAnimation.crossFadeTo(this.animations[death], 0.25, true);
    this.animations[death].play();
    this.alive = false;
    this.health = 0;

    setTimeout(() => {
      this.moving = false;
      this.running = false;
      this.attacking = false;

      this.setDirection('Idle');
      this.currentAnimation.stop();

      this.currentAnimation = this.animations[death];
      this.lastAnimation = this.crawling ? 'death' : 'headshot';
    }, 250);
  }

  update (delta) {
    super.update(delta);

    if (this.visiblePlayer && this.alive) {
      this.character.lookAt(this.playerPosition);
    }
  }

  get _direction () {
    let direction = this.running ? 'Running' : this.moving ? 'Walking' : 'Idle';
    return this.crawling ? this.gettingHit ? 'Idle' : 'Crawling' : direction;
  }
};