import type { Texture } from 'three/src/textures/Texture';
import type { Object3D } from 'three/src/core/Object3D';
import type { Vector3 } from 'three/src/math/Vector3';
import type { GameEvent } from '@/events/GameEvents';
import type { Assets } from '@/loaders/AssetsLoader';

import { GameEvents } from '@/events/GameEvents';
import type { HitData } from '@/weapons/types';
import Enemy from '@/characters/Enemy';
import Physics from '@/physics';

export default class Enemies
{
  private readonly onHeadHit = this.headHit.bind(this);
  private readonly onBodyHit = this.bodyHit.bind(this);
  private readonly onLegHit = this.legHit.bind(this);
  private readonly onDeath = this.death.bind(this);

  private readonly enemies: Array<Enemy> = [];
  private enemyModel!: Assets.GLTFModel;

  public constructor (private readonly envMap: Texture) {
    (new Enemy).loadCharacter(envMap).then(model => {
      this.enemyModel = model;
      // this.spawnEnemy();
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
      this.enemies.length
    );

    this.enemies.push(enemy);
    Physics.setCharacter(enemy.collider);
  }

  private headHit (event: GameEvent): void {
    const { enemy, damage, headshot } = event.data as HitData;
    this.enemies[enemy].headHit(damage, headshot);
  }

  private bodyHit (event: GameEvent): void {
    const { enemy, damage } = event.data as HitData;
    this.enemies[enemy].bodyHit(damage);
  }

  private legHit (event: GameEvent): void {
    const { enemy, damage } = event.data as HitData;
    this.enemies[enemy].legHit(damage);
  }

  private death (event: GameEvent): void {
    const id = event.data as number;
    this.enemies.splice(id, 1);
  }

  public update (delta: number, player: Vector3): void {
    for (let enemy = this.enemies.length; enemy--;) {
      this.enemies[enemy].update(delta, player);
    }
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
}
