import type { Texture } from 'three/src/textures/Texture';
import type { Object3D } from 'three/src/core/Object3D';
import type { HitDirection } from '@/characters/types';

import type { Vector3 } from 'three/src/math/Vector3';
import type { GameEvent } from '@/events/GameEvents';
import type { Assets } from '@/loaders/AssetsLoader';

import { degToRad } from 'three/src/math/MathUtils';
import { GameEvents } from '@/events/GameEvents';
import type { HitData } from '@/weapons/types';

import Enemy from '@/characters/Enemy';
import { PI } from '@/utils/Number';
import Physics from '@/physics';

export default class Enemies
{
  private readonly onHeadHit = this.headHit.bind(this);
  private readonly onBodyHit = this.bodyHit.bind(this);
  private readonly onLegHit = this.legHit.bind(this);
  private readonly onDeath = this.death.bind(this);

  private readonly enemies: Array<Enemy> = [];
  private enemyModel!: Assets.GLTFModel;
  private spawnedEnemies = 0.0;

  public constructor (private readonly envMap: Texture) {
    (new Enemy).loadCharacter(envMap).then(model => {
      this.enemyModel = model;
      this.spawnEnemy();
    });

    this.addEvents();
  }

  private addEvents (): void {
    GameEvents.add('Enemy::Death', this.onDeath);
    GameEvents.add('Hit::Head', this.onHeadHit);
    GameEvents.add('Hit::Body', this.onBodyHit);
    GameEvents.add('Hit::Leg', this.onLegHit);
  }

  private spawnEnemy (): void {
    const enemy = new Enemy(
      this.enemyModel, this.envMap,
      this.spawnedEnemies++
    );

    this.enemies.push(enemy);
    Physics.setCharacter(enemy.collider);
    GameEvents.dispatch('Enemy::Spawn', enemy);
  }

  private headHit (event: GameEvent): void {
    const { enemy, damage, headshot } = event.data as HitData;
    const index = this.getEnemyIndex(enemy);
    this.enemies[index].headHit(damage, headshot);
  }

  private bodyHit (event: GameEvent): void {
    const { enemy, damage } = event.data as HitData;
    const index = this.getEnemyIndex(enemy);
    this.enemies[index].bodyHit(damage);
  }

  private legHit (event: GameEvent): void {
    const { enemy, damage } = event.data as HitData;
    const index = this.getEnemyIndex(enemy);
    this.enemies[index].legHit(damage);
  }

  private death (event: GameEvent): void {
    const index = this.getEnemyIndex(event.data as number);
    this.enemies.splice(index, 1);
    this.spawnEnemy();
  }

  public update (delta: number, player: Vector3): void {
    for (let enemy = this.enemies.length; enemy--;) {
      this.enemies[enemy].update(delta, player);
    }
  }

  public getHitDirection (enemy: Vector3, player: Vector3, rotation: number): HitDirection {
    let angle = Math.atan2(enemy.z - player.z, enemy.x - player.x);

    const orientation = degToRad(rotation);
    let direction: HitDirection = 'Front';

    if (Math.abs(orientation) > PI.m075) {
      angle = Math.abs(angle);

      direction = angle < PI.d4 ? 'Right'
        : angle > PI.m075 ? 'Left' : 'Front';
    }

    else if (orientation < -PI.d4 && orientation > -PI.m075) {
      angle *= -1.0;

      direction = angle < -PI.d4 && angle > -PI.m075 ? 'Right'
        : angle < PI.m075 && angle > PI.d4 ? 'Left' : 'Front';
    }

    else if (Math.abs(orientation) < PI.d4) {
      angle = Math.abs(angle);

      direction = angle > PI.m075 ? 'Right'
      : angle < PI.d4 ? 'Left' : 'Front';
    }

    else if (orientation < PI.m075 && orientation > PI.d4) {
      angle *= -1.0;

      direction = angle < PI.m075 && angle > PI.d4 ? 'Right'
        : angle < -PI.d4 && angle > -PI.m075 ? 'Left' : 'Front';
    }

    return direction;
  }

  public getEnemy (uuid: string): Enemy | undefined {
    return this.enemies.find(enemy => enemy.collider.uuid === uuid);
  }

  public getEnemyIndex (id: number): number {
    return this.enemies.findIndex(enemy => enemy.index === id);
  }

  private removeEvents (): void {
    GameEvents.remove('Enemy::Death');
    GameEvents.remove('Hit::Head');
    GameEvents.remove('Hit::Body');
    GameEvents.remove('Hit::Leg');
  }

  public dispose (): void {
    for (let enemy = this.enemies.length; enemy--;) {
      this.enemies[enemy].dispose();
      delete this.enemies[enemy];
    }

    this.enemyModel.scene.clear();
    this.enemies.splice(0);
    this.removeEvents();
  }

  public get colliders (): Array<Object3D> {
    const colliders = [];

    for (let enemy = this.enemies.length; enemy--;) {
      colliders.push(...this.enemies[enemy].hitBox);
    }

    return colliders;
  }

  public set playerDead (dead: boolean) {
    for (let enemy = this.enemies.length; enemy--;) {
      this.enemies[enemy].playerDeath = dead;
    }
  }
}
