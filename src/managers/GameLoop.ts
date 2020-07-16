type EnemyAssets = { model: Assets.GLTF, sounds: Sounds };
type Sounds = Array<AudioBuffer>;

import { Assets } from '@/managers/AssetsLoader';
// import GameEvents from '@/managers/GameEvents';
import Level0 from '@/environment/Level0';
import Enemy from '@/characters/Enemy';
import { Settings } from '@/settings';

export default class GameLoop {
  private enemyAssets: EnemyAssets | null = null;
  private readonly loader = new Assets.Loader();
  private raf: number | void = undefined;

  private level = new Level0();
  private paused = true;

  public constructor () {
    this.loadAssets();
  }

  private async loadAssets (): Promise<Sounds> {
    this.enemyAssets = await this.loadEnemyAssets();
    return await this.loadPlayerSounds();
  }

  private async loadEnemyAssets (): Promise<EnemyAssets> {
    return {
      model: (await new Enemy().load()).scene,

      sounds: await Promise.all(
        Object.values(Settings.Enemy.sounds)
          .map(this.loader.loadAudio.bind(this.loader))
      )
    };
  }

  private async loadPlayerSounds (): Promise<Sounds> {
    return await Promise.all(
      Object.values(Settings.Player.sounds)
        .map(this.loader.loadAudio.bind(this.loader))
    );
  }

  private update (): void {
    this.raf = requestAnimationFrame(this.update.bind(this));
    this.level.render();
  }

  public destroy (): void {
    cancelAnimationFrame(this.raf as number);
    this.level.destroy();
  }

  public set pause (pause: boolean) {
    this.paused = pause;

    this.raf = this.paused
      ? cancelAnimationFrame(this.raf as number)
      : requestAnimationFrame(this.update.bind(this));
  }

  public get pause (): boolean {
    return this.paused;
  }

  public get scene (): HTMLCanvasElement {
    return this.level.canvas;
  }
}
