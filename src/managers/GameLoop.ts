type EnemyAssets = { model: Assets.GLTFModel, sounds: Array<AudioBuffer> };
type Stats = typeof import('three/examples/js/libs/stats.min');
type Object3D = import('@three/core/Object3D').Object3D;

import { GameEvents, GameEvent } from '@/managers/GameEvents';
import { Player, Location } from '@/characters/Player';
import { Assets } from '@/managers/AssetsLoader';

import { Clock } from '@three/core/Clock';
import Level0 from '@/environment/Level0';
import Physics from '@/managers/Physics';

import Enemy from '@/characters/Enemy';
import { Settings } from '@/settings';
import Pistol from '@/weapons/Pistol';
import Input from '@/managers/Input';

export default class GameLoop {
  private clock = new Clock();
  private level = new Level0();

  private pistol = new Pistol();
  private player = new Player();

  private enemyAssets?: EnemyAssets;
  private readonly loader = new Assets.Loader();
  private readonly input = new Input(this.player);

  private paused = true;
  private stats?: Stats;

  public constructor () {
    this.addEventListeners();
    this.level.createColliders();
    this.loadCharacters().then(assets => this.enemyAssets = assets);

    if (Settings.DEBUG) {
      import(/* webpackChunkName: "stats.min" */ 'three/examples/js/libs/stats.min').then((Stats) => {
        this.stats = new Stats.default();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.domElement);
      });
    }
  }

  private async loadCharacters (): Promise<EnemyAssets> {
    const character = await this.player.loadCharacter();
    const playerSounds = await this.loadPlayerSounds();
    const enemyAssets = await this.loadEnemyAssets();

    Physics.setPlayer(this.player.collider);

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
    this.level.addObject(event.data as Object3D);
  }

  public update (): void {
    this.stats?.begin();

    const delta = this.clock.getDelta();
    this.player.update(delta);

    if (this.player.alive) {
      Physics.update(delta);
      this.input.update();
    }

    this.level.render();
    this.stats?.end();
  }

  public destroy (): void {
    this.level.destroy();
    Physics.destroy();

    if (Settings.DEBUG) {
      document.body.removeChild(this.stats.domElement);
      delete this.stats;
    }
  }

  public get playerLocation (): Location {
    return this.player.location;
  }

  public get scene (): HTMLCanvasElement {
    return this.level.canvas;
  }

  public set pause (pause: boolean) {
    this.paused = pause;

    this.paused
      ? this.input.exitPointerLock()
      : this.input.requestPointerLock();
  }

  public get pause (): boolean {
    return this.paused;
  }
}
