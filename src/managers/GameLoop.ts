type EnemyAssets = { model: Assets.GLTFModel, sounds: Array<AudioBuffer> };
import type { CharacterSound, Location, Coords } from '@/types.d';
type Stats = typeof import('three/examples/js/libs/stats.min');
type CharacterSounds = { [sfx in CharacterSound]: string };
type Object3D = import('@three/core/Object3D').Object3D;

import { GameEvents, GameEvent } from '@/managers/GameEvents';
import { Assets } from '@/managers/AssetsLoader';

import { Clock } from '@three/core/Clock';
import Level0 from '@/environment/Level0';
import Physics from '@/managers/Physics';
import Player from '@/characters/Player';
import Enemy from '@/characters/Enemy';

import Worker from '@/managers/worker';
import Pistol from '@/weapons/Pistol';
import Input from '@/managers/Input';
import Rifle from '@/weapons/Rifle';
import { Config } from '@/config';

export default class GameLoop {
  private clock = new Clock();
  private level = new Level0();

  private rifle = new Rifle();
  private pistol = new Pistol();
  private player = new Player();

  // private enemyAssets?: EnemyAssets;
  private enemies: Array<Enemy> = [];

  private readonly worker = new Worker();
  private readonly loader = new Assets.Loader();
  private readonly input = new Input(this.player);

  private paused = true;
  private stats?: Stats;

  public constructor () {
    this.addEventListeners();
    this.level.createColliders();
    this.loadCharacters(); // .then(assets => this.enemyAssets = assets);

    if (Config.DEBUG) {
      import(/* webpackChunkName: "stats.min" */ 'three/examples/js/libs/stats.min').then(Stats => {
        this.stats = new Stats.default();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.domElement);
      });
    }

    setTimeout(() => this.spawnRifle(), 5000);
  }

  private async loadCharacters (): Promise<EnemyAssets> {
    this.level.addObject(await this.player.loadCharacter());

    this.player.addSounds(await this.loadCharacterSounds(
      Config.Player.sounds as CharacterSounds
    ));

    this.player.setPistol(this.enemyColliders, this.pistol);
    Physics.setPlayer(this.player.collider);

    return await this.loadEnemyAssets();
  }

  private async loadEnemyAssets (): Promise<EnemyAssets> {
    return {
      model: await new Enemy().load(),
      sounds: await this.loadCharacterSounds(
        Config.Enemy.sounds as CharacterSounds
      )
    };
  }

  private async loadCharacterSounds (sounds: CharacterSounds): Promise<Array<AudioBuffer>> {
    return await Promise.all(
      Object.values(sounds).map(
        this.loader.loadAudio.bind(this.loader)
      )
    );
  }

  private addEventListeners (): void {
    GameEvents.add('remove:object', this.removeGameObject.bind(this));
    GameEvents.add('add:object', this.addGameObject.bind(this));
    GameEvents.add('weapon:pick', this.pickRifle.bind(this));

    this.worker.add('Level:coord', data =>
      this.rifle.spawn(data as Coords), {
        minCoords: Level0.minCoords,
        maxCoords: Level0.maxCoords,
        bounds: Level0.bounds
      }
    );
  }

  private removeGameObject (event: GameEvent): void {
    this.level.removeObject(event.data as Object3D);
  }

  private addGameObject (event: GameEvent): void {
    this.level.addObject(event.data as Object3D);
  }

  private pickRifle (event: GameEvent): void {
    this.player.pickRifle(this.rifle);
    this.removeGameObject(event);
  }

  private spawnRifle (): void {
    if (this.rifle.onStage) return;
    const player = this.playerLocation.position;
    this.worker.get('Level:coord', { player });
  }

  public update (): void {
    this.stats?.begin();

    const playerPosition = this.player.location.position;
    const delta = this.clock.getDelta();

    this.rifle.update(playerPosition);
    this.player.update(delta);

    if (this.player.alive) {
      Physics.update(delta);
    }

    this.level.render();
    this.stats?.end();
  }

  public destroy (): void {
    this.level.destroy();
    Physics.destroy();

    if (Config.DEBUG) {
      document.body.removeChild(this.stats.domElement);
      delete this.stats;
    }
  }

  private get enemyColliders (): Array<Object3D> {
    const colliders = [];

    for (let enemy = this.enemies.length; enemy--;) {
      colliders.push(...this.enemies[enemy].hitBox);
    }

    return colliders;
  }

  public get playerLocation (): Location {
    return this.player.location;
  }

  public get scene (): HTMLCanvasElement {
    return this.level.canvas;
  }

  public set pause (pause: boolean) {
    Physics.pause = pause;
    this.paused = pause;

    if (!Config.freeCamera) {
      this.paused
        ? this.input.exitPointerLock()
        : this.input.requestPointerLock();
    }
  }

  public get pause (): boolean {
    return this.paused;
  }
}
