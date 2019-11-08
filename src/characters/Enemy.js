import { MeshBasicMaterial } from '@three/materials/MeshBasicMaterial';
import { BoxGeometry } from '@three/geometries/BoxGeometry';
import CapsuleGeometry from '@/utils/CapsuleGeometry';
import { SkeletonUtils } from '@utils/SkeletonUtils';

import config from '@/assets/characters/enemy.json';
import ZOMBIE from '@/assets/characters/enemy.glb';

import Character from '@/characters/Character';
import { Vector3 } from '@three/math/Vector3';
import { LoopOnce } from '@three/constants';
import { Mesh } from '@three/objects/Mesh';
import { random } from '@/utils/number';
import anime from 'animejs';

const colliderMaterial = new MeshBasicMaterial({ visible: false });

export default class Enemy extends Character {
  constructor (id, character, animations, onLoad) {
    if (character) {
      const clone = SkeletonUtils.clone(character);
      super(ZOMBIE, config, null);

      this.createMixer(clone);
      this.cloneMaterial(clone);
      this.createAnimations(animations);
      this._setDefaultState(id, clone, animations, null);
    } else {
      super(
        ZOMBIE, config, (character, gltfAnimations) =>
          this._setDefaultState(id, character, gltfAnimations, onLoad)
      );
    }

    this.playerPosition = new Vector3();
    this.nextToPlayer = false;
    this.crawlTimeout = null;
    this.gettingHit = false;

    this.hitTimeout = null;
    this.hitFadeOut = null;
    this.runTimeout = null;

    this.screaming = false;
    this.attacking = false;
    this.crawling = false;
    this.running = false;
    this.moving = true;
  }

  _setDefaultState (id, character, animations, onLoad) {
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

    this.currentAnimation = this.animations.walk;
    this.setDirection('Walking');
    this.currentAnimation.play();
    this.lastAnimation = 'walk';

    this.character = character;
    this.colliders = [];
    this.id = id;

    this._addHeadCollider(character);
    this._addBodyCollider(character);
    this._addLegsCollider(character);

    if (onLoad) {
      this._mesh.material.opacity = 0;
      onLoad(character, animations);
    }
  }

  _addHeadCollider (character) {
    this.head = character.getObjectByName('Head');

    const headCollider = new Mesh(
      new BoxGeometry(18, 20, 20),
      colliderMaterial.clone()
    );

    headCollider.userData.enemy = this.id;
    this.colliders.push(headCollider);
    headCollider.position.y += 5;
    headCollider.position.z += 3;
    this.head.add(headCollider);
  }

  _addBodyCollider (character) {
    this.spine = character.getObjectByName('Spine');

    const bodyCollider = new Mesh(
      CapsuleGeometry(20, 50),
      colliderMaterial.clone()
    );

    bodyCollider.rotation.x -= Math.PI / 2;
    bodyCollider.position.y += 15;
    bodyCollider.position.z += 5;

    bodyCollider.userData.enemy = this.id;
    this.colliders.push(bodyCollider);
    this.spine.add(bodyCollider);
  }

  _addLegsCollider (character) {
    this.rightUpLeg = character.getObjectByName('RightUpLeg');
    this.leftUpLeg = character.getObjectByName('LeftUpLeg');
    this.rightLeg = character.getObjectByName('RightLeg');
    this.leftLeg = character.getObjectByName('LeftLeg');

    const upperLeg = new Mesh(
      new BoxGeometry(16, 50, 15),
      colliderMaterial.clone()
    );

    const lowerLeg = new Mesh(
      new BoxGeometry(10, 50, 10),
      colliderMaterial.clone()
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

    this.rightUpLeg.add(rightUpLegCollider);
    this.leftUpLeg.add(leftUpLegCollider);
    this.rightLeg.add(rightLegCollider);
    this.leftLeg.add(leftLegCollider);
  }

  setRandomPosition () {
    const z = random(-this.bounds.front, this.bounds.front);
    const x = random(-this.bounds.side, this.bounds.side);
    this.character.position.set(x, 0, z);
  }

  /* idle () {
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
  } */

  walk () {
    if (!this.alive || this.crawling) return;

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

  scream () {
    if (!this.alive || this.crawling) return;

    this.currentAnimation.crossFadeTo(this.animations.scream, 0.233, true);
    this.animations.scream.play();
    this.setDirection('Idle');

    this.attacking = false;
    this.screaming = true;
    this.running = false;
    this.moving = false;

    setTimeout(() => {
      this.lastAnimation = 'run';
      this.currentAnimation.stop();
      this.currentAnimation = this.animations.scream;

      this.runTimeout = setTimeout(() => {
        this.screaming = false;
        if (!this.crawling) this.run();
      }, 2400);
    }, 233);
  }

  run () {
    if (!this.alive) return;

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

  attack () {
    if (!this.alive || this.attacking) return 0;

    const hard = this.health > 50 && Math.random() < 0.5;
    const delay = this.crawling ? 2200 : hard ? 3000 : 2500;
    const hitDelay = this.crawling ? 250 : hard ? 750 : 1000;

    const attack = this.crawling ? 'crawlAttack' : hard ? 'hardAttack' : 'softAttack';
    const lastAnimation = this.crawling ? 'crawl' : this.lastAnimation;
    const duration = this.crawling ? 0.5 : 0.166;

    this.currentAnimation.crossFadeTo(this.animations[attack], duration, true);
    this.animations[attack].play();

    this.attacking = true;
    this.running = false;
    this.moving = false;

    setTimeout(() => {
      this.setDirection('Idle');
      this.lastAnimation = attack;
      this.currentAnimation.stop();

      this.currentAnimation = this.animations[attack];
      setTimeout(() => { this[lastAnimation](); }, delay);
    }, duration * 1000);

    return hitDelay;
  }

  bodyHit (amount) {
    this.health -= amount;
    this._checkIfAlive();

    if (this.alive && !this.crawling) {
      const setIdle = this.moving || this.running || this.screaming;
      const direction = this._direction;

      this.animations.hit.stopFading();
      clearTimeout(this.hitTimeout);
      clearTimeout(this.hitFadeOut);
      clearTimeout(this.runTimeout);
      this.animations.hit.stop();

      this.screaming = false;
      this.setDirection('Idle');
      this.animations.hit.fadeIn(0.1);

      if (setIdle) {
        setTimeout(() => {
          this.currentAnimation.stop();
        }, 100);
      }

      this.animations.hit.play();
      this.gettingHit = true;

      this.hitFadeOut = setTimeout(() => {
        this.animations.hit.fadeOut(0.25);
      }, 750);

      this.hitTimeout = setTimeout(() => {
        this.animations.hit.stop();
        this.gettingHit = false;

        if (setIdle || this.lastAnimation === 'run') {
          this.currentAnimation = this.animations.hit;
          this.setDirection(direction);
          this[this.lastAnimation]();
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
      clearTimeout(this.runTimeout);
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
    const duration = this.lastAnimation === 'legHit' ? 3 : 0.5;

    this.currentAnimation.crossFadeTo(this.animations.crawling, duration, true);
    this.animations.crawling.play();
    this.setDirection('Falling');

    this.gettingHit = false;
    this.attacking = false;
    this.crawling = true;
    this.running = false;
    this.moving = true;

    this.crawlTimeout = setTimeout(() => {
      this.lastAnimation = 'crawl';
      this.currentAnimation.stop();

      this.setDirection('Crawling');
      this.currentAnimation = this.animations.crawling;
    }, duration * 1000);
  }

  _checkIfAlive () {
    if (!this.alive) return;
    this.alive = this.alive && this.health > 0;
    if (!this.alive) this.death();
  }

  death () {
    const death = this.crawling ? 'crawlDeath' : 'death';
    this.currentAnimation.crossFadeTo(this.animations[death], 0.133, true);
    this.animations[death].play();
    this.fadeOut(this.crawling);

    this.attacking = false;
    this.running = false;
    this.moving = false;

    setTimeout(() => {
      this.setDirection('Idle');
      this.currentAnimation.stop();
      this.currentAnimation = this.animations[death];
    }, 133);
  }

  headshot () {
    const crawling = this.crawling && !this.gettingHit;
    const death = crawling ? 'crawlDeath' : 'headshot';

    if (crawling && this.lastAnimation !== 'crawl') {
      this.animations.crawling.stopFading();
      this.currentAnimation.stopFading();
      this.animations.crawling.stop();
      clearTimeout(this.crawlTimeout);
    }

    this.currentAnimation.crossFadeTo(this.animations[death], 0.5, true);
    this.animations[death].play();
    this.fadeOut(crawling);

    this.attacking = false;
    this.running = false;
    this.moving = false;
    this.alive = false;
    this.health = 0;

    setTimeout(() => {
      this.setDirection('Idle');
      this.currentAnimation.stop();
      this.currentAnimation = this.animations[death];
    }, 500);
  }

  fadeIn () {
    const character = this._mesh;

    anime({
      targets: character.material,
      easing: 'linear',
      duration: 1000,
      opacity: 1,

      begin: () => {
        this.character.visible = true;
      }
    });
  }

  fadeOut (crawling) {
    const delay = crawling ? 1500 : 3500;
    const character = this._mesh;

    anime({
      targets: character.material,
      easing: 'linear',
      duration: 1000,
      delay: delay,
      opacity: 0,

      complete: () => {
        this.character.visible = false;
      }
    });
  }

  update (delta) {
    super.update(delta);

    if (this.alive) {
      this.character.lookAt(this.playerPosition);
    }
  }

  get _direction () {
    let direction = this.running ? 'Running' : this.moving ? 'Walking' : 'Idle';
    return this.crawling ? this.gettingHit ? 'Idle' : 'Crawling' : direction;
  }

  get _mesh () {
    return this.character.children[0].children[1];
  }
};
