// type EnemyAssets = { model: Assets.GLTFModel, sounds: Array<AudioBuffer> };
// import type { CharacterSound, Location, Coords } from '@/types';
// type CharacterSounds = { [sfx in CharacterSound]: string };

import { GameEvents, GameEvent } from '@/events/GameEvents';
import type { Texture } from 'three/src/textures/Texture';
import type { Object3D } from 'three/src/core/Object3D';

// import { Assets } from '@/managers/AssetsLoader';
import LevelScene from '@/environment/LevelScene';
import { Clock } from 'three/src/core/Clock';
import type Enemy from '@/characters/Enemy';

import Camera from '@/managers/GameCamera';
import Player from '@/characters/Player';

// import Worker from '@/managers/worker';
import Pistol from '@/weapons/Pistol';
// import Music from '@/managers/Music';

// import Input from '@/managers/Input';
import Rifle from '@/weapons/Rifle';
// import { Config } from '@/config';
import Physics from '@/physics';

export default class GameLoop
{
  private rifle!: Rifle;
  private pistol!: Pistol;

  private readonly level: LevelScene;
  private readonly clock = new Clock();

  private readonly player = new Player();
  // private readonly enemyAssets?: EnemyAssets;
  private readonly enemies: Array<Enemy> = [];

  // private readonly worker = new Worker();
  // private readonly loader = new Assets.Loader();

  // private readonly input = new Input(this.player);
  // private readonly music = new Music(Config.Level.music);

  private readonly loop = this.update.bind(this);
  private readonly onSceneLoad = this.onLoad.bind(this);

  private paused = true;
  private raf!: number;

  public constructor (scene: HTMLCanvasElement, pixelRatio: number) {
    GameEvents.add('Scene:envMap', this.onSceneLoad);
    this.level = new LevelScene(scene, pixelRatio);
  }

  private async onLoad (event: GameEvent): Promise<void> {
    const envMap = event.data as Texture;

    this.pistol = new Pistol(envMap);
    this.rifle = new Rifle(envMap);

    /* this.enemyAssets = await */ this.loadCharacters();
    this.raf = requestAnimationFrame(this.loop);
  }

  private async loadCharacters (): Promise<void> /* Promise<EnemyAssets> */ {
    const player = await this.player.loadCharacter();
    GameEvents.dispatch('Add:object', player);

    // this.player.addSounds(await this.loadCharacterSounds(
    //   Config.Player.sounds as CharacterSounds
    // ));

    this.player.setPistol(this.enemyColliders, this.pistol);
    Physics.setPlayer(this.player.collider);

    // return await this.loadEnemyAssets();
  }

  // private async loadEnemyAssets (): Promise<EnemyAssets> {
  //   return {
  //     model: await new Enemy().load(),
  //     sounds: await this.loadCharacterSounds(
  //       Config.Enemy.sounds as CharacterSounds
  //     )
  //   };
  // }

  // private async loadCharacterSounds (sounds: CharacterSounds): Promise<Array<AudioBuffer>> {
  //   return await Promise.all(
  //     Object.values(sounds).map(
  //       this.loader.loadAudio.bind(this.loader)
  //     )
  //   );
  // }

  private update (): void {
    this.raf = requestAnimationFrame(this.loop);
    const delta = Math.min(this.clock.getDelta(), 0.1);

    // const playerPosition = this.player.location.position;

    // const position = this.level.outOfBounds(playerPosition);
    // position !== null && this.player.teleport(position);

    // this.rifle.update(playerPosition);
    // this.player.update(delta);
    Camera.updateState();
    this.level.render(delta);

    // if (this.player.alive) {
    //   Physics.update(delta);
    // }
  }

  public resize (width: number, height: number): void {
    this.level.resize(width, height);
    Camera.resize();
  }

  public dispose (): void {
    cancelAnimationFrame(this.raf);

    this.level.dispose();
    // this.music.dispose();
    // Physics.dispose();
  }

  public set pause (pause: boolean) {
    // this.music[pause ? 'pause' : 'play']();

    // this.level.pause = pause;
    // Physics.pause = pause;
    this.paused = pause;

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

  // private removeGameObject (event: GameEvent): void {
  //   this.level.removeObject(event.data as Object3D);
  // }

  // private addGameObject (event: GameEvent): void {
  //   this.level.addObject(event.data as Object3D);
  // }

  // private pickRifle (event: GameEvent): void {
  //   this.player.pickRifle(this.rifle);
  //   this.removeGameObject(event);
  // }

  // public update (): void {
  //   const delta = Math.min(this.clock.getDelta(), 0.1);
  //   const playerPosition = this.player.location.position;

  //   const position = this.level.outOfBounds(playerPosition);
  //   position !== null && this.player.teleport(position);

  //   this.rifle.update(playerPosition);
  //   this.player.update(delta);
  //   this.level.render(delta);

  //   if (this.player.alive) {
  //     Physics.update(delta);
  //   }
  // }

  // public destroy (): void {
  //   this.level.destroy();
  //   this.music.destroy();
  //   Physics.destroy();
  // }

  private get enemyColliders (): Array<Object3D> {
    const colliders = [];

    for (let enemy = this.enemies.length; enemy--;) {
      colliders.push(...this.enemies[enemy].hitBox);
    }

    return colliders;
  }

  // public get playerLocation (): Location {
  //   return this.player.location;
  // }

  // public get scenes (): Array<HTMLCanvasElement> {
  //   return this.level.scenes;
  // }

  // public set pause (pause: boolean) {
  //   this.music[pause ? 'pause' : 'play']();

  //   this.level.pause = pause;
  //   Physics.pause = pause;
  //   this.paused = pause;

  //   if (!Config.freeCamera) {
  //     this.paused
  //       ? this.input.exitPointerLock()
  //       : this.input.requestPointerLock();
  //   }
  // }

  // public get pause (): boolean {
  //   return this.paused;
  // }
}
