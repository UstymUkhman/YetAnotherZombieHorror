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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public update (delta: number): void {}

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
