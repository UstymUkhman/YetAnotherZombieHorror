import type { Texture } from 'three/src/textures/Texture';
import type { Object3D } from 'three/src/core/Object3D';
import type { Vector3 } from 'three/src/math/Vector3';
import type { GameEvent } from '@/events/GameEvents';
import type { Assets } from '@/loaders/AssetsLoader';

import { GameEvents } from '@/events/GameEvents';
import Enemy from '@/characters/Enemy';
import Physics from '@/physics';

export default class Enemies
{
  private readonly onHeadHit = this.headHit.bind(this);
  private readonly onBodyHit = this.bodyHit.bind(this);
  private readonly onLegHit = this.legHit.bind(this);

  private enemyModel!: Assets.GLTFModel;
  private readonly enemies: Array<Enemy> = [];

  public constructor (private readonly envMap: Texture) {
    (new Enemy).loadCharacter(envMap).then(model => {
      this.enemyModel = model;
      // this.spawnEnemy();
    });

    GameEvents.add('Hit::Head', this.onHeadHit);
    GameEvents.add('Hit::Body', this.onBodyHit);
    GameEvents.add('Hit::Leg', this.onLegHit);
  }

  private headHit (event: GameEvent): void {
    const enemy = event.data as number;
    this.enemies[enemy].headHit();
  }

  private bodyHit (event: GameEvent): void {
    const enemy = event.data as number;
    this.enemies[enemy].bodyHit();
  }

  private legHit (event: GameEvent): void {
    const enemy = event.data as number;
    this.enemies[enemy].legHit();
  }

  private spawnEnemy (): void {
    const enemy = new Enemy(
      this.enemyModel, this.envMap,
      this.enemies.length
    );

    this.enemies.push(enemy);
    Physics.setCharacter(enemy.collider);
  }

  public update (delta: number, player: Vector3): void {
    for (let enemy = this.enemies.length; enemy--;) {
      this.enemies[enemy].update(delta, player);
    }
  }

  public dispose (): void {
    for (let enemy = this.enemies.length; enemy--;) {
      this.enemies[enemy].dispose();
      delete this.enemies[enemy];
    }

    this.enemyModel.scene.clear();
    this.enemies.splice(0);
  }

  public get colliders (): Array<Object3D> {
    const colliders = [];

    for (let enemy = this.enemies.length; enemy--;) {
      colliders.push(...this.enemies[enemy].hitBox);
    }

    return colliders;
  }
}
