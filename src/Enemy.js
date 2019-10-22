import { MeshBasicMaterial } from '@three/materials/MeshBasicMaterial';
import { BoxGeometry } from '@three/geometries/BoxGeometry';
import CapsuleGeometry from '@/utils/CapsuleGeometry';

import ZOMBIE from '@/assets/gltf/zombie.glb';
import { Vector3 } from '@three/math/Vector3';
import { LoopOnce } from '@three/constants';
import { Mesh } from '@three/objects/Mesh';

import config from '@/assets/enemy.json';
import Character from '@/Character';

const colliderMaterial = new MeshBasicMaterial({
  transparent: true,
  color: 0xFF0000,
  visible: true,
  opacity: 0.5
});

export default class Enemy extends Character {
  constructor (onLoad) {
    super(ZOMBIE, config, enemy => {
      this.currentAnimation = this.animations.idle;

      this.animations.softAttack.clampWhenFinished = true;
      this.animations.hardAttack.clampWhenFinished = true;

      this.animations.headshot.clampWhenFinished = true;
      this.animations.scream.clampWhenFinished = true;
      this.animations.death.clampWhenFinished = true;

      this.animations.softAttack.setLoop(LoopOnce);
      this.animations.hardAttack.setLoop(LoopOnce);

      this.animations.headshot.setLoop(LoopOnce);
      this.animations.scream.setLoop(LoopOnce);
      this.animations.death.setLoop(LoopOnce);

      this._addHeadCollider(enemy);
      this._addBodyCollider(enemy);
      this._addLegsCollider(enemy);

      this.currentAnimation.play();
      this.character = enemy;
      onLoad(enemy);
    });

    this.playerPosition = new Vector3();
    this.visiblePlayer = false;
    this.nextToPlayer = false;
    this.attacking = false;
  }

  _addHeadCollider (character) {
    const head = character.getObjectById(10, true);

    this.head = new Mesh(
      new BoxGeometry(20, 25, 25),
      colliderMaterial
    );

    this.head.position.y += 5;
    head.add(this.head);
  }

  _addBodyCollider (character) {
    const spine = character.getObjectById(6, true);

    this.body = new Mesh(
      CapsuleGeometry(20, 50),
      colliderMaterial
    );

    this.body.rotation.x -= Math.PI / 2;
    this.body.position.y += 12.5;
    this.body.position.z += 2.5;

    spine.add(this.body);
  }

  _addLegsCollider (character) {
    const rightUpLeg = character.getObjectById(53, true);
    const leftUpLeg = character.getObjectById(49, true);
    const rightLeg = character.getObjectById(54, true);
    const leftLeg = character.getObjectById(50, true);

    const upperLeg = new Mesh(
      new BoxGeometry(15, 50, 15),
      colliderMaterial
    );

    const lowerLeg = new Mesh(
      new BoxGeometry(10, 50, 10),
      colliderMaterial
    );

    lowerLeg.position.y -= 27.5;
    upperLeg.position.y -= 20;

    this.rightUpLeg = upperLeg.clone();
    this.leftUpLeg = upperLeg.clone();
    this.rightLeg = lowerLeg.clone();
    this.leftLeg = lowerLeg.clone();

    rightUpLeg.add(this.rightUpLeg);
    leftUpLeg.add(this.leftUpLeg);
    rightLeg.add(this.rightLeg);
    leftLeg.add(this.leftLeg);
  }

  idle () {
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
    this.currentAnimation.crossFadeTo(this.animations.scream, 0.133, true);
    this.animations.scream.play();

    this.attacking = false;
    this.running = false;
    this.moving = false;

    setTimeout(() => {
      this.currentAnimation.stop();
      this.lastAnimation = 'scream';
      this.currentAnimation = this.animations.scream;
      if (run) setTimeout(() => { this.run(); }, 2500);
    }, 133);
  }

  run () {
    this.currentAnimation.crossFadeTo(this.animations.run, 0.1, true);
    this.animations.run.play();

    setTimeout(() => {
      this.moving = true;
      this.running = true;
      this.attacking = false;

      this.lastAnimation = 'run';
      this.currentAnimation.stop();

      this.setDirection('Running');
      this.currentAnimation = this.animations.run;
    }, 100);
  }

  attack (hard = false) {
    const attack = hard ? 'hardAttack' : 'softAttack';
    const lastAnimation = this.lastAnimation;

    this.currentAnimation.crossFadeTo(this.animations[attack], 0.166, true);
    this.animations[attack].play();

    this.attacking = true;
    this.running = false;
    this.moving = false;

    setTimeout(() => {
      this.lastAnimation = attack;
      this.currentAnimation.stop();

      this.currentAnimation = this.animations[attack];
      setTimeout(() => { this[lastAnimation](); }, hard ? 4400 : 2500);
    }, 166);
  }

  update (delta) {
    super.update(delta);

    if (this.visiblePlayer) {
      this.character.lookAt(this.playerPosition);
    }
  }
};
