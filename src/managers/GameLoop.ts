type EnemyAssets = { model: Assets.GLTFModel, sounds: Array<AudioBuffer> };

import { Assets } from '@/managers/AssetsLoader';
// import GameEvents from '@/managers/GameEvents';
import Level0 from '@/environment/Level0';
import Player from '@/characters/Player';
import Enemy from '@/characters/Enemy';
import { Settings } from '@/settings';
import Pistol from '@/weapons/Pistol';

export default class GameLoop {
  private readonly loader = new Assets.Loader();
  private enemyAssets?: EnemyAssets;
  private raf?: number | void;

  private player = new Player();
  private level = new Level0();

  private pistol = new Pistol(this.level.getCamera());

  private paused = true;

  public constructor () {
    this.loadCharacters().then(assets => this.enemyAssets = assets);
  }

  private async loadCharacters (): Promise<EnemyAssets> {
    const character = await this.player.loadCharacter();
    const playerSounds = await this.loadPlayerSounds();
    const enemyAssets = await this.loadEnemyAssets();
    const audioListener = this.level.audioListener;

    this.player.addSounds(playerSounds, audioListener);
    this.player.setPistol(this.pistol);
    this.level.addModel(character);
    return enemyAssets;
  }

  private async loadPlayerSounds (): Promise<Array<AudioBuffer>> {
    return await Promise.all(
      Object.values(Settings.Player.sounds)
        .map(this.loader.loadAudio.bind(this.loader))
    );
  }

  private async loadEnemyAssets (): Promise<EnemyAssets> {
    return {
      model: await new Enemy().load(),

      sounds: await Promise.all(
        Object.values(Settings.Enemy.sounds)
          .map(this.loader.loadAudio.bind(this.loader))
      )
    };
  }

  private update (delta: number): void {
    this.raf = requestAnimationFrame(this.update.bind(this));
    this.player.update(delta);
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
