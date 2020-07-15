import { Assets } from '@/managers/AssetsLoader';
// import GameEvents from '@/managers/GameEvents';
import Level0 from '@/environment/Level0';
import Enemy from '@/characters/Enemy';
import { Settings } from '@/settings';

type Sounds = Array<AudioBuffer>;

export default class GameLoop {
  private readonly loader = new Assets.Loader();

  private level = new Level0();
  private paused = false;
  private raf: number;

  public constructor () {
    this.raf = requestAnimationFrame(this.update.bind(this));
    this.loadAssets();
  }

  private async loadAssets (): Promise<Array<Sounds>> {
    const playerSounds = await this.loadPlayerSounds();
    const enemySounds = await this.loadEnemySounds();

    return [playerSounds, enemySounds];
  }

  private async loadPlayerSounds (): Promise<Sounds> {
    return await Promise.all(
      Object.values(Settings.Player.sounds)
        .map(this.loader.loadAudio.bind(this.loader))
    );
  }

  private async loadEnemySounds (): Promise<Sounds> {
    return await Promise.all(
      Object.values(Settings.Enemy.sounds)
        .map(this.loader.loadAudio.bind(this.loader))
    );
  }

  private loadCharacters (): void {
    new Enemy(0).load().then(
      character => this.level.addModel(character.scene)
    );
  }

  private update (): void {
    this.raf = requestAnimationFrame(this.update.bind(this));

    if (!this.paused) {
      this.level.render();
    }
  }

  public destroy (): void {
    cancelAnimationFrame(this.raf);
    this.level.destroy();
  }

  public set pause (pause: boolean) {
    this.paused = pause;
  }

  public get pause (): boolean {
    return this.paused;
  }

  public get scene (): HTMLCanvasElement {
    return this.level.canvas;
  }
}
