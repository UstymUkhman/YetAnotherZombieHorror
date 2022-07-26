import { GameEvents, GameEvent } from '@/events/GameEvents';
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
import Rifle from '@/weapons/Rifle';

import Coords from '@/utils/Coords';
import Controls from '@/controls';
import RAF from '@/managers/RAF';
import Physics from '@/physics';

export default class MainLoop
{
  private rifle!: Rifle;
  private pistol!: Pistol;
  private enemies!: Enemies;

  private readonly level: LevelScene;
  private readonly clock = new Clock();
  private readonly player = new Player();

  private readonly loop = this.update.bind(this);
  private readonly controls = new Controls(this.player);
  private readonly onSceneLoad = this.onLoad.bind(this);

  public constructor (scene: HTMLCanvasElement, pixelRatio: number, private readonly worker?: WebWorker) {
    this.level = new LevelScene(scene, pixelRatio, worker);
    GameEvents.dispatch('Game::LoopInit', null, true);
    this.addEventListeners();
  }

  private addEventListeners (): void {
    GameEvents.add('Level::EnvMap', this.onSceneLoad);

    this.worker?.add('Level::GetRandomCoord', event => {
      if (Coords.addLevelCoords(event.data as LevelCoords)) {
        GameEvents.dispatch('Loading::Complete', null, true);
        // setTimeout(this.spawnRifle.bind(this), 1e4);
      }

      else this.worker?.post('Level::GetRandomCoord');
    }, {
      minCoords: LevelScene.minCoords,
      maxCoords: LevelScene.maxCoords,
      portals: LevelScene.portals,
      bounds: LevelScene.bounds
    });

    GameEvents.add('Player::PickRifle', () => {
      setTimeout(this.spawnRifle.bind(this), 1e4);
      this.player.pickRifle();
    });
  }

  private async onLoad (event: GameEvent): Promise<void> {
    const envMap = event.data as Texture;

    this.player.loadCharacter(envMap).then(() => {
      this.player.setPistol(this.enemies.colliders, this.pistol);
      Physics.setCharacter(this.player.collider, 90);
      this.player.addRifle(this.rifle);

      this.createRandomCoords();
      RAF.add(this.loop);
    });

    this.enemies = new Enemies(envMap);
    this.pistol = new Pistol(envMap);
    this.rifle = new Rifle(envMap);
  }

  private createRandomCoords (): void {
    if (this.worker) {
      return this.worker.post('Level::GetRandomCoord');
    }

    Coords.fillRandomLevelCoords();
    // setTimeout(this.spawnRifle.bind(this), 1e4);
    GameEvents.dispatch('Loading::Complete', null, true);
  }

  private spawnRifle (): void {
    if (this.rifle.onStage) return;
    this.rifle.spawn(Coords.getRandomLevelCoords(this.player.coords));
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

    const playerLocation = this.player.location;
    const position = this.level.outOfBounds(playerLocation.position);

    this.enemies.update(delta, playerLocation.position);
    position && this.player.teleport(position);

    GameEvents.dispatch('Characters::Location', {
      player: playerLocation
    }, true);

    return position ?? playerLocation.position;
  }

  public resize (width: number, height: number): void {
    this.level.resize(width, height);
    this.pistol?.resize(height);
    this.rifle?.resize(height);
    Camera.resize();
  }

  private removeEventListeners (): void {
    this.worker?.remove('Level::GetRandomCoord');
    GameEvents.remove('Player::PickRifle');
    GameEvents.remove('Level::EnvMap');
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
