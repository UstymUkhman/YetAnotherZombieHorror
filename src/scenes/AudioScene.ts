import type { CharacterSoundsConfig, CharacterSoundConfig, PlayerSounds, EnemySounds, CharacterSound } from '@/characters/types';
import type { WeaponSoundsConfig, WeaponSoundConfig, PistolSounds, RifleSounds, WeaponSound } from '@/weapons/types';

import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { PositionalAudio } from 'three/src/audio/PositionalAudio';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { AudioListener } from 'three/src/audio/AudioListener';
import { GameEvents, GameEvent } from '@/events/GameEvents';

import type { Vector3 } from 'three/src/math/Vector3';
import { Object3D } from 'three/src/core/Object3D';
import { CameraManager } from '@/managers/Camera';

import { Assets } from '@/loaders/AssetsLoader';
import { Scene } from 'three/src/scenes/Scene';
import { Audio } from 'three/src/audio/Audio';
import { randomInt } from '@/utils/Number';

import Settings from '@/settings';
import RAF from '@/managers/RAF';
import Configs from '@/configs';
import anime from 'animejs';

export default class AudioScene
{
  private readonly playerSounds: Map<keyof PlayerSounds, PositionalAudio> = new Map();
  private readonly enemySounds: Map<keyof EnemySounds, PositionalAudio> = new Map();

  private readonly pistolSounds: Map<keyof PistolSounds, PositionalAudio> = new Map();
  private readonly rifleSounds: Map<keyof RifleSounds, PositionalAudio> = new Map();

  private readonly onDisposeEnemy = this.disposeEnemy.bind(this);
  private readonly onCharacter = this.playCharacter.bind(this);

  private readonly enemies: Map<string, Object3D> = new Map();

  private readonly onSpawnEnemy = this.spawnEnemy.bind(this);
  private readonly onThunder = this.playThuder.bind(this);

  private readonly onWeapon = this.playWeapon.bind(this);
  private readonly onUpdate = this.update.bind(this);

  private readonly camera = new PerspectiveCamera(
    CameraManager.config.fov, CameraManager.config.aspect,
    CameraManager.config.near, CameraManager.config.far
  );

  private readonly listener = new AudioListener();
  private readonly renderer = new WebGLRenderer();

  private readonly thunder = new Object3D();
  private readonly weapon = new Object3D();

  private readonly player = new Object3D();
  private readonly scene = new Scene();

  private ambient?: Audio;

  public constructor () {
    this.renderer.debug.checkShaderErrors = !PRODUCTION;
    this.scene.matrixWorldAutoUpdate = false;

    this.camera.matrixAutoUpdate = false;
    this.scene.matrixAutoUpdate = false;

    this.camera.add(this.listener);
    this.scene.add(this.player);

    this.createCharacterSounds(Configs.Player.sounds, true);
    this.createCharacterSounds(Configs.Enemy.sounds, false);

    this.createWeaponSounds(Configs.Pistol.sounds, true);
    this.createWeaponSounds(Configs.Rifle.sounds, false);

    this.addEventListeners();
    RAF.add(this.onUpdate);
  }

  private async loadSounds (sounds: ReadonlyArray<string>): Promise<Array<AudioBuffer>> {
    return Promise.all(sounds.map(
      Assets.Loader.loadAudio.bind(Assets.Loader)
    ));
  }

  private async createCharacterSounds (sfx: CharacterSoundsConfig, player: boolean): Promise<void> {
    const names = Object.keys(sfx) as unknown as Array<CharacterSound>;
    const soundsMap = player ? this.playerSounds : this.enemySounds;
    const sounds = await this.loadSounds(Object.values(sfx));

    sounds.forEach((sound, s) => {
      const audio = new PositionalAudio(this.listener);
      let volume = names[s] === 'scream' ? 1.0 : 0.5;

      volume = names[s] === 'death' ? 2.5 : volume;
      audio.setVolume(volume).setBuffer(sound);

      player && this.player.add(audio);
      soundsMap.set(names[s], audio);
      audio.name = names[s];
    });
  }

  private async createWeaponSounds (sfx: WeaponSoundsConfig, pistol: boolean): Promise<void> {
    const soundsMap = pistol ? this.pistolSounds : this.rifleSounds;
    const names = Object.keys(sfx) as unknown as Array<WeaponSound>;
    const sounds = await this.loadSounds(Object.values(sfx));

    sounds.forEach((sound, s) => {
      const audio = new PositionalAudio(this.listener);
      let volume = names[s] === 'bullet' ? 0.25 : 2.5;

      volume = names[s] === 'shoot' ? 5.0 : volume;
      audio.setVolume(volume).setBuffer(sound);

      soundsMap.set(names[s], audio);
      this.weapon.add(audio);
    });
  }

  private async createThunderSounds (): Promise<void> {
    const sounds = await this.loadSounds(Configs.Level.lighting);

    sounds.forEach(sound => {
      const audio = new PositionalAudio(this.listener);

      audio.setBuffer(sound);
      this.thunder.add(audio);
    });
  }

  private async createAmbientSound (): Promise<void> {
    const ambient = await Assets.Loader.loadAudio(Configs.Level.ambient);
    this.ambient = new Audio(this.listener);

    this.ambient.setBuffer(ambient);
    this.ambient.autoplay = false;

    this.ambient.setVolume(0.0);
    this.ambient.setLoop(true);
  }

  private disposeEnemy (event: GameEvent): void {
    const uuid = event.data as string;
    const enemy = this.enemies.get(uuid) as Object3D;

    this.scene.remove(enemy.clear());
    this.enemies.delete(uuid);
  }

  public async updateAmbient (): Promise<void> {
    if (Settings.getVisualValue('lighting')) {
      this.createThunderSounds();
    }

    if (Settings.getVisualValue('raining')) {
      await this.createAmbientSound();
      this.scene.updateMatrixWorld(true);

      setTimeout(() => anime({
        begin: () => this.ambient?.play(),
        targets: { volume: this.ambient?.getVolume() },
        update: ({ animations }) => this.ambient?.setVolume(
          +animations[0].currentValue
        ),

        easing: 'linear',
        duration: 1e3,
        volume: 0.25
      }), 100);
    }
  }

  private spawnEnemy (event: GameEvent): void {
    const enemy = new Object3D();
    const uuid = event.data as string;

    this.enemySounds.forEach((audio, name) => {
      const clone = new PositionalAudio(this.listener);

      clone.setBuffer(audio.buffer as AudioBuffer)
        .setVolume(audio.getVolume())
        .name = name;

      enemy.add(clone);
    });

    this.scene.add(enemy);
    this.enemies.set(uuid, enemy);
  }

  private removeEventListeners (): void {
    GameEvents.remove('Enemy::Dispose', true);
    GameEvents.remove('SFX::Character', true);
    GameEvents.remove('Enemy::Spawn', true);
    GameEvents.remove('SFX::Thunder', true);
    GameEvents.remove('SFX::Weapon', true);
  }

  private addEventListeners (): void {
    GameEvents.add('Enemy::Dispose', this.onDisposeEnemy, true);
    GameEvents.add('SFX::Character', this.onCharacter, true);
    GameEvents.add('Enemy::Spawn', this.onSpawnEnemy, true);
    GameEvents.add('SFX::Thunder', this.onThunder, true);
    GameEvents.add('SFX::Weapon', this.onWeapon, true);
  }

  private playThuder (event: GameEvent): void {
    this.thunder.position.copy(event.data as Vector3);

    this.thunder.updateMatrix();
    this.thunder.updateMatrixWorld();

    const distance = this.thunder.position.distanceToSquared(this.listener.position);
    const audioIndex = randomInt(0, this.thunder.children.length - 1);

    const thunder = this.thunder.children[audioIndex] as PositionalAudio;
    const duration = (thunder.buffer?.duration ?? 0) * 1e3;

    thunder.setRefDistance(distance / Configs.Level.depth);
    thunder.setVolume(1.0);
    thunder.play();

    setTimeout(() => anime({
      targets: { volume: thunder?.getVolume() },
      complete: () => thunder?.stop(),

      update: ({ animations }) => thunder?.setVolume(
        +animations[0].currentValue
      ),

      easing: 'linear',
      duration: 500,
      volume: 0.0
    }), duration - 500);
  }

  private playCharacter (event: GameEvent): void {
    let character = this.player;
    const { sfx, uuid, matrix, play } = event.data as CharacterSoundConfig;
    let sound = this.playerSounds.get(sfx as keyof PlayerSounds) as PositionalAudio;

    if (this.enemies.has(uuid)) {
      character = this.enemies.get(uuid) as Object3D;
      sound = character.getObjectByName(sfx) as PositionalAudio;
    }

    character.matrixWorld.copy(matrix);
    character.updateMatrix();
    character.updateMatrixWorld();

    play
      ? !sound.isPlaying && sound.play()
      : sound.isPlaying && sound.stop();
  }

  private playWeapon (event: GameEvent): void {
    const { sfx, pistol, matrix, play, delay } = event.data as WeaponSoundConfig;
    const soundsMap = pistol ? this.pistolSounds : this.rifleSounds;
    const sound = soundsMap.get(sfx) as PositionalAudio;

    this.weapon.matrixWorld.copy(matrix);
    this.weapon.updateMatrix();
    this.weapon.updateMatrixWorld();

    play
      ? !sound.isPlaying && sound.play(delay)
      : sound.isPlaying && sound.stop();
  }

  private update (): void {
    this.updateCameraState();
    this.renderer.render(this.scene, this.camera);
  }

  private updateCameraState (): void {
    const { fov, aspect, near, far, matrix } = CameraManager.config;

    this.camera.matrixWorld.copy(matrix);
    this.camera.updateMatrix();
    this.camera.updateMatrixWorld();

    this.camera.aspect = aspect;
    this.camera.near = near;
    this.camera.far = far;
    this.camera.fov = fov;
  }

  public set pause (paused: boolean) {
    this.ambient?.[paused ? 'pause' : 'play']();
    this.listener.setMasterVolume(+!paused);
  }

  public dispose (): void {
    while (this.scene.children.length > 0)
      this.scene.remove(this.scene.children[0]);

    this.removeEventListeners();
    this.playerSounds.clear();
    this.pistolSounds.clear();
    this.enemySounds.clear();
    this.rifleSounds.clear();

    RAF.remove(this.onUpdate);
    this.renderer.dispose();
    this.enemies.clear();
    this.pause = true;
  }
}
