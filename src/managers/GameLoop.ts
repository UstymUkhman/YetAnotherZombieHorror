type EnemyAssets = { model: Assets.GLTFModel, sounds: Array<AudioBuffer> };
import { GameEvents, GameEvent } from '@/managers/GameEvents';
type Object3D = import('@three/core/Object3D').Object3D;
import { Player, Location } from '@/characters/Player';
import { Assets } from '@/managers/AssetsLoader';

import { Clock } from '@three/core/Clock';
import Level0 from '@/environment/Level0';
import Physics from '@/managers/Physics';

import Enemy from '@/characters/Enemy';
import { Settings } from '@/settings';
import Pistol from '@/weapons/Pistol';

export default class GameLoop {
  private readonly loader = new Assets.Loader();
  private enemyAssets?: EnemyAssets;
  private raf?: number | void;

  private physics = new Physics();
  private pistol = new Pistol();
  private player = new Player();
  private level = new Level0();
  private clock = new Clock();

  private paused = true;

  public constructor () {
    this.addEventListeners();
    this.loadCharacters().then(assets => this.enemyAssets = assets);

    this.physics.addGround(Settings.Level0.bounds);

    this.physics.addBounds(
      Settings.Level0.height,
      Settings.Level0.position.y,
      Settings.Level0.bounds
    );
  }

  private async loadCharacters (): Promise<EnemyAssets> {
    const character = await this.player.loadCharacter();
    const playerSounds = await this.loadPlayerSounds();
    const enemyAssets = await this.loadEnemyAssets();

    this.player.addSounds(playerSounds);
    this.player.setPistol(this.pistol);
    this.level.addObject(character);
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

  private addEventListeners (): void {
    GameEvents.add('add:object', this.addGameObject.bind(this));
  }

  private addGameObject (event: GameEvent): void {
    this.level.addObject(event.data as Assets.GLTF | Object3D);
  }

  private update (): void {
    this.raf = requestAnimationFrame(this.update.bind(this));
    const delta = this.clock.getDelta();

    this.player.update(delta);
    this.physics.update();
    this.level.render();
  }

  public destroy (): void {
    cancelAnimationFrame(this.raf as number);
    this.level.destroy();
  }

  public get playerLocation (): Location {
    return this.player.location;
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
