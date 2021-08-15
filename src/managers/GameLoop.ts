import { GameEvents, GameEvent } from '@/events/GameEvents';
import type { Texture } from 'three/src/textures/Texture';

import LevelScene from '@/environment/LevelScene';
import { Clock } from 'three/src/core/Clock';
import Camera from '@/managers/GameCamera';

import Enemies from '@/managers/Enemies';
import Player from '@/characters/Player';

import Pistol from '@/weapons/Pistol';
import Rifle from '@/weapons/Rifle';
import Physics from '@/physics';

export default class GameLoop
{
  private raf!: number;
  private paused = true;

  private rifle!: Rifle;
  private pistol!: Pistol;
  private enemies!: Enemies;

  private readonly level: LevelScene;
  private readonly clock = new Clock();
  private readonly player = new Player();

  private readonly loop = this.update.bind(this);
  private readonly onSceneLoad = this.onLoad.bind(this);

  public constructor (scene: HTMLCanvasElement, pixelRatio: number) {
    GameEvents.add('Scene:envMap', this.onSceneLoad);
    this.level = new LevelScene(scene, pixelRatio);
  }

  private async onLoad (event: GameEvent): Promise<void> {
    const envMap = event.data as Texture;

    this.player.loadCharacter(envMap).then(() => {
      this.player.setPistol(this.enemies.colliders, this.pistol);
      this.raf = requestAnimationFrame(this.loop);
      Physics.setPlayer(this.player.collider);
      this.pause = false;
    });

    this.enemies = new Enemies(envMap);
    this.pistol = new Pistol(envMap);
    this.rifle = new Rifle(envMap);
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

  public dispose (): void {
    cancelAnimationFrame(this.raf);

    this.level.dispose();
    Physics.dispose();
  }

  public set pause (paused: boolean) {
    // this.music[paused ? 'pause' : 'play']();

    this.level.pause = paused;
    Physics.pause = paused;
    this.paused = paused;

    // this.paused
    //   ? this.input.exitPointerLock()
    //   : this.input.requestPointerLock();
  }

  public get pause (): boolean {
    return this.paused;
  }

  // private addEventListeners (): void {
  //   GameEvents.add('remove:object', this.removeGameObject.bind(this));
  //   GameEvents.add('add:object', this.addGameObject.bind(this));
  //   GameEvents.add('weapon:pick', this.pickRifle.bind(this));

  //   this.worker.add('Level:coord', data =>
  //     this.rifle.spawn(data as Coords), {
  //       minCoords: LevelScene.minCoords,
  //       maxCoords: LevelScene.maxCoords,
  //       portals: LevelScene.portals,
  //       bounds: LevelScene.bounds
  //     }
  //   );
  // }

  // private pickRifle (event: GameEvent): void {
  //   this.player.pickRifle(this.rifle);
  //   this.removeGameObject(event);
  // }

  // public get playerLocation (): Location {
  //   return this.player.location;
  // }
}
