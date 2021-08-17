import { GameEvents, GameEvent } from '@/events/GameEvents';
import type { Texture } from 'three/src/textures/Texture';
import type { LevelCoords } from '@/environment/types';

import LevelScene from '@/environment/LevelScene';
import { Clock } from 'three/src/core/Clock';
import WebWorker from '@/worker/WebWorker';

import Enemies from '@/managers/Enemies';
import Player from '@/characters/Player';

import Camera from '@/managers/Camera';
import Pistol from '@/weapons/Pistol';
import Rifle from '@/weapons/Rifle';

import Physics from '@/physics';
// import Input from '@/inputs';

export default class MainLoop
{
  private raf!: number;
  private paused = true;

  private rifle!: Rifle;
  private pistol!: Pistol;
  private enemies!: Enemies;

  private readonly level: LevelScene;
  private readonly clock = new Clock();
  private readonly player = new Player();
  private readonly worker = new WebWorker();

  private readonly loop = this.update.bind(this);
  // private readonly input = new Input(this.player);
  private readonly onSceneLoad = this.onLoad.bind(this);

  public constructor (scene: HTMLCanvasElement, pixelRatio: number) {
    this.level = new LevelScene(scene, pixelRatio);
    this.addEventListeners();
  }

  private addEventListeners (): void {
    GameEvents.add('Rifle::Pick', this.pickRifle.bind(this));
    GameEvents.add('Level::EnvMap', this.onSceneLoad);

    this.worker.add('Level::GetRandomCoord', data =>
      this.rifle.spawn(data as LevelCoords), {
        minCoords: LevelScene.minCoords,
        maxCoords: LevelScene.maxCoords,
        portals: LevelScene.portals,
        bounds: LevelScene.bounds
      }
    );
  }

  private async onLoad (event: GameEvent): Promise<void> {
    const envMap = event.data as Texture;

    this.player.loadCharacter(envMap).then(() => {
      this.player.setPistol(this.enemies.colliders, this.pistol);
      GameEvents.dispatch('Loading::Complete', null, true);
      Physics.setPlayer(this.player.collider);
    });

    this.enemies = new Enemies(envMap);
    this.pistol = new Pistol(envMap);
    this.rifle = new Rifle(envMap);
  }

  /* private spawnRifle (): void {
    if (this.rifle.onStage) return;
    const player = this.playerLocation.position;
    this.worker.post('Level::GetRandomCoord', { player });
  } */

  private pickRifle (event: GameEvent): void {
    this.player.pickRifle(this.rifle);
    this.level.removeModel(event);
  }

  private update (): void {
    this.raf = requestAnimationFrame(this.loop);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const playerPosition = this.player.location.position;

    const position = this.level.outOfBounds(playerPosition);
    position !== null && this.player.teleport(position);

    this.rifle.update(playerPosition);
    this.player.update(delta);

    Camera.updateState();
    this.level.render(delta);

    if (this.player.alive) {
      Physics.update(delta);
    }
  }

  public resize (width: number, height: number): void {
    this.level.resize(width, height);
    Camera.resize();
  }

  private removeEventListeners (): void {
    this.worker.remove('Level::GetRandomCoord');
    GameEvents.remove('Level::EnvMap');
    GameEvents.remove('Rifle::Pick');
  }

  public dispose (): void {
    cancelAnimationFrame(this.raf);
    this.removeEventListeners();

    this.level.dispose();
    Physics.dispose();
  }

  // public get playerLocation (): Location {
  //   return this.player.location;
  // }

  public set pause (paused: boolean) {
    this.level.pause = paused;
    Physics.pause = paused;
    this.paused = paused;

    // this.paused
    //   ? this.input.exitPointerLock()
    //   : this.input.requestPointerLock();

    this.paused
      ? cancelAnimationFrame(this.raf)
      : this.raf = requestAnimationFrame(this.loop);
  }
}
