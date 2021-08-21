import type { Texture } from 'three/src/textures/Texture';
import type { Object3D } from 'three/src/core/Object3D';
import type { Assets } from '@/loaders/AssetsLoader';

import Enemy from '@/characters/Enemy';

export default class Enemies
{
  private enemyModel!: Assets.GLTFModel;
  private readonly enemies: Array<Enemy> = [];

  public constructor (private readonly envMap: Texture) {
    const enemy = new Enemy();
    this.enemies.push(enemy);

    enemy.loadCharacter(envMap).then(
      model => this.enemyModel = model
    );
  }

  public spawnEnemy (): void {
    this.enemies.push(new Enemy(
      this.enemyModel, this.envMap,
      this.enemies.length
    ));
  }

  public get colliders (): Array<Object3D> {
    const colliders = [];

    for (let enemy = this.enemies.length; enemy--;) {
      colliders.push(...this.enemies[enemy].hitBox);
    }

    return colliders;
  }
}
