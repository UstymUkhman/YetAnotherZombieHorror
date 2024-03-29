import { GameEvents, GameEvent } from '@/events/GameEvents';
import type { EnemyAttackData } from '@/characters/types';
import type { Texture } from 'three/src/textures/Texture';
import type { Vector3 } from 'three/src/math/Vector3';
import type { LevelCoords } from '@/scenes/types';
import type WebWorker from '@/worker/WebWorker';

import LevelScene from '@/scenes/LevelScene';
import { Clock } from 'three/src/core/Clock';
import Enemies from '@/managers/Enemies';
import Player from '@/characters/Player';

import Camera from '@/managers/Camera';
import Pistol from '@/weapons/Pistol';
import Coords from '@/utils/Coords';
import Rifle from '@/weapons/Rifle';

import Controls from '@/controls';
import RAF from '@/managers/RAF';
import Configs from '@/configs';
import Physics from '@/physics';

export default class MainLoop
{
  private rifle!: Rifle;
  private pistol!: Pistol;
  private enemyKills = 0.0;
  private enemies!: Enemies;

  private readonly level: LevelScene;
  private readonly clock = new Clock();
  private readonly player = new Player();

  private readonly loop = this.update.bind(this);
  private readonly controls = new Controls(this.player);

  private readonly onSceneLoad = this.onLoad.bind(this);
  private readonly onPlayerHit = this.playerHit.bind(this);

  public constructor (scene: HTMLCanvasElement, pixelRatio: number, private readonly worker?: WebWorker) {
    this.level = new LevelScene(scene, pixelRatio, worker);
    GameEvents.dispatch('Game::LoopInit', null, true);
    this.addEventListeners();
  }

  private addEventListeners (): void {
    GameEvents.add('Level::EnvMap', this.onSceneLoad);
    GameEvents.add('Enemy::Attack', this.onPlayerHit);

    this.worker?.add('Level::GetRandomCoord', event => {
      if (Coords.addLevelCoords(event.data as LevelCoords)) {
        GameEvents.dispatch('Loading::Complete', null, true);
      }

      else this.worker?.post('Level::GetRandomCoord');
    }, {
      minCoords: LevelScene.minCoords,
      maxCoords: LevelScene.maxCoords,
      portals: LevelScene.portals,
      bounds: LevelScene.bounds
    });

    GameEvents.add('Enemy::Active', event => {
      !event.data && this.onEnemyKill();
      this.player.setTargets(this.enemies.colliders);
    });

    GameEvents.add('Player::PickRifle', () =>
      this.player.pickRifle()
    );

    GameEvents.add('Player::Death', event =>
      this.enemies.playerDead = event.data
    );
  }

  private async onLoad (event: GameEvent): Promise<void> {
    const envMap = event.data as Texture;

    this.player.loadCharacter(envMap).then(() => {
      Physics.setCharacter(this.player.collider);
      this.player.setPistol(this.level.walls, this.pistol);

      this.enemies = new Enemies(envMap);
      this.player.addRifle(this.rifle);

      this.createRandomCoords();
      RAF.add(this.loop);
    });

    this.pistol = new Pistol(envMap);
    this.rifle = new Rifle(envMap);
  }

  public start (): void { return; }

  private playerHit (event: GameEvent): void {
    const { position: ePosition, damage } = event.data as EnemyAttackData;
    const { position: pPosition, rotation } = this.player.location;

    const direction = this.enemies.getHitDirection(
      ePosition, pPosition, rotation
    );

    this.player.hit(direction, damage);
  }

  private createRandomCoords (): void {
    if (this.worker) {
      return this.worker.post('Level::GetRandomCoord');
    }

    Coords.fillRandomLevelCoords();
    GameEvents.dispatch('Loading::Complete', null, true);
  }

  private onEnemyKill (): void {
    const { x, z } = this.player.location.position;
    this.enemies.spawnMultiple(x, z);
    !(++this.enemyKills % Configs.Gameplay.rifleSpawn) && this.spawnRifle(x, z);
  }

  private spawnRifle (x: number, z: number): void {
    !this.rifle.onStage && this.rifle.spawn(Coords.getRandomLevelCoords(x, z));
  }

  private update (): void {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const playerPosition = this.updateCharactersLocation(delta);

    this.player.alive && Physics.update(delta);
    this.rifle.update(playerPosition);

    this.level.render(delta);
    Camera.updateState();
  }

  private updateCharactersLocation (delta: number): Vector3 {
    this.player.update(delta);
    const { location } = this.player;

    const position = this.level.outOfBounds(location.position);
    const enemies = this.enemies.update(delta, location.position);

    position && this.player.teleport(position);

    GameEvents.dispatch('Characters::Location', {
      player: location, enemies
    }, true);

    return position ?? location.position;
  }

  public resize (width: number, height: number): void {
    this.level.resize(width, height);
    this.pistol.resize(height);
    this.rifle.resize(height);
    Camera.resize();
  }

  private removeEventListeners (): void {
    this.worker?.remove('Level::GetRandomCoord');
    GameEvents.remove('Player::PickRifle');
    GameEvents.remove('Player::Death');

    GameEvents.remove('Level::EnvMap');
    GameEvents.remove('Enemy::Active');
    GameEvents.remove('Enemy::Attack');
  }

  public dispose (): void {
    this.removeEventListeners();

    this.controls.dispose();
    this.enemies.dispose();
    this.player.dispose();

    this.pistol.dispose();
    this.rifle.dispose();
    this.level.dispose();

    Physics.dispose();
    Camera.dispose();
    RAF.dispose();
  }

  public set inputs (disabled: boolean) {
    this.controls.pause = disabled;
  }

  public set pause (paused: boolean) {
    this.level.pause = paused;
    Physics.pause = paused;
    RAF.pause = paused;
  }
}
