import { GameEvents, GameEvent } from '@/events/GameEvents';
import type { Texture } from 'three/src/textures/Texture';
// import { getRandomCoord } from '@/worker/getRandomCoord';

// import type { LevelCoords } from '@/environment/types';
import type { Vector3 } from 'three/src/math/Vector3';

import LevelScene from '@/environment/LevelScene';
import { Clock } from 'three/src/core/Clock';
// import WebWorker from '@/worker/WebWorker';

import Enemies from '@/managers/Enemies';
import Player from '@/characters/Player';

import Camera from '@/managers/Camera';
import Pistol from '@/weapons/Pistol';
import Rifle from '@/weapons/Rifle';

import RAF from '@/managers/RAF';
import Physics from '@/physics';
// import Configs from '@/configs';
import Input from '@/inputs';

export default class MainLoop
{
  private rifle!: Rifle;
  private pistol!: Pistol;
  private enemies!: Enemies;

  private readonly level: LevelScene;
  private readonly clock = new Clock();
  private readonly player = new Player();
  // private readonly worker = new WebWorker();

  private readonly loop = this.update.bind(this);
  private readonly input = new Input(this.player);
  private readonly onSceneLoad = this.onLoad.bind(this);

  public constructor (scene: HTMLCanvasElement, pixelRatio: number) {
    this.level = new LevelScene(scene, pixelRatio);
    this.addEventListeners();
  }

  private addEventListeners (): void {
    GameEvents.add('Rifle::Pick', this.pickRifle.bind(this));
    GameEvents.add('Level::EnvMap', this.onSceneLoad);

    // Need to uncomment this in order to support Firefox:
    // this.worker.add('Level::GetRandomCoord', data =>
    //   this.rifle.spawn(data as LevelCoords), {
    //     minCoords: LevelScene.minCoords,
    //     maxCoords: LevelScene.maxCoords,
    //     portals: LevelScene.portals,
    //     bounds: LevelScene.bounds
    //   }
    // );
  }

  private async onLoad (event: GameEvent): Promise<void> {
    const envMap = event.data as Texture;

    this.player.loadCharacter(envMap).then(() => {
      this.player.setPistol(this.enemies.colliders, this.pistol);
      GameEvents.dispatch('Loading::Complete', null, true);

      Physics.setPlayer(this.player.collider);
      RAF.add(this.loop);
    });

    this.enemies = new Enemies(envMap);
    this.pistol = new Pistol(envMap);
    this.rifle = new Rifle(envMap);
  }

  // private spawnRifle (): void {
  //   if (this.rifle.onStage) return;

  //   Configs.worker &&
  //     /* ? */ this.rifle.spawn(getRandomCoord({
  //       player: this.player.location.position,
  //       minCoords: LevelScene.minCoords,
  //       maxCoords: LevelScene.maxCoords,
  //       portals: LevelScene.portals,
  //       bounds: LevelScene.bounds
  //     }));

  //     // Need to uncomment this in order to support Firefox:
  //     // : this.worker.post('Level::GetRandomCoord', {
  //     //   player: this.player.location.position
  //     // });
  // }

  private pickRifle (event: GameEvent): void {
    this.player.pickRifle(this.rifle);
    this.level.removeModel(event);
  }

  private update (): void {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const playerPosition = this.updateCharactersLocation(delta);

    this.rifle.update(playerPosition);

    Camera.updateState();
    this.level.render(delta);

    if (this.player.alive) {
      Physics.update(delta);
    }
  }

  private updateCharactersLocation (delta: number): Vector3 {
    // this.enemies.update(delta);
    this.player.update(delta);

    const playerLocation = this.player.location;
    const playerPosition = playerLocation.position;
    const position = this.level.outOfBounds(playerPosition);

    position && this.player.teleport(position);

    GameEvents.dispatch('Characters::Location', {
      player: playerLocation
    }, true);

    return position ?? playerPosition;
  }

  public resize (width: number, height: number): void {
    this.level.resize(width, height);
    Camera.resize();
  }

  private removeEventListeners (): void {
    // Need to uncomment this in order to support Firefox:
    // this.worker.remove('Level::GetRandomCoord');
    GameEvents.remove('Level::EnvMap');
    GameEvents.remove('Rifle::Pick');
  }

  public dispose (): void {
    this.removeEventListeners();
    this.level.dispose();
    Physics.dispose();
    RAF.dispose();
  }

  public set pause (paused: boolean) {
    this.level.pause = paused;
    this.input.pause = paused;

    Physics.pause = paused;
    RAF.pause = paused;
  }
}
