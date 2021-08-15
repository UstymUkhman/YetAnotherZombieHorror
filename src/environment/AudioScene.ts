import type { CharacterSoundsConfig, CharacterSoundConfig, CharacterSounds, CharacterSound } from '@/characters/types';
import type { WeaponSoundsConfig, WeaponSoundConfig, WeaponSounds, WeaponSound } from '@/weapons/types';

import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { PositionalAudio } from 'three/src/audio/PositionalAudio';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { AudioListener } from 'three/src/audio/AudioListener';

import type { Vector3 } from 'three/src/math/Vector3';
import { GameCamera } from '@/managers/GameCamera';
import { Object3D } from 'three/src/core/Object3D';

import { GameEvents } from '@/events/GameEvents';
import { Assets } from '@/loaders/AssetsLoader';
import { Scene } from 'three/src/scenes/Scene';
import { Audio } from 'three/src/audio/Audio';

import { randomInt } from '@/utils/Number';
import { Config } from '@/config';
import anime from 'animejs';

export default class AudioScene
{
  private readonly characterSounds: CharacterSounds = new Map();
  private readonly weaponSounds: WeaponSounds = new Map();

  private readonly onCharacter = this.playCharacter.bind(this);
  private readonly onThunder = this.playThuder.bind(this);

  private readonly onWeapon = this.playWeapon.bind(this);
  private readonly onUpdate = this.update.bind(this);

  private readonly camera = new PerspectiveCamera(
    GameCamera.config.fov, GameCamera.config.aspect,
    GameCamera.config.near, GameCamera.config.far
  );

  private readonly listener = new AudioListener();
  private readonly renderer = new WebGLRenderer();

  private readonly character = new Object3D();
  private readonly thunder = new Object3D();
  private readonly weapon = new Object3D();
  private readonly scene = new Scene();

  private ambient!: Audio;
  private raf!: number;

  public constructor () {
    this.camera.matrixAutoUpdate = false;
    this.camera.add(this.listener);
    this.scene.autoUpdate = false;

    this.createCharacterSounds(Config.Player.sounds);
    this.createCharacterSounds(Config.Enemy.sounds);

    this.createWeaponSounds(Config.Pistol.sounds);
    this.createWeaponSounds(Config.Rifle.sounds);

    this.createThunderSounds();
    this.createAmbientSound();
    this.addEventListeners();
  }

  private async loadSounds (sounds: ReadonlyArray<string>): Promise<Array<AudioBuffer>> {
    return Promise.all(sounds.map(
      Assets.Loader.loadAudio.bind(Assets.Loader)
    ));
  }

  private async createCharacterSounds (sfx: CharacterSoundsConfig): Promise<void> {
    const names = Object.keys(sfx) as unknown as Array<CharacterSound>;
    const sounds = await this.loadSounds(Object.values(sfx));

    sounds.forEach((sound, s) => {
      const audio = new PositionalAudio(this.listener);

      audio.setBuffer(sound);
      audio.setVolume(10.0);

      this.characterSounds.set(names[s], audio);
      this.character.add(audio);
    });
  }

  private async createWeaponSounds (sfx: WeaponSoundsConfig): Promise<void> {
    const names = Object.keys(sfx) as unknown as Array<WeaponSound>;
    const sounds = await this.loadSounds(Object.values(sfx));

    sounds.forEach((sound, s) => {
      const audio = new PositionalAudio(this.listener);
      const volume = names[s] === 'shoot' ? 10 : 5;

      audio.setBuffer(sound);
      audio.setVolume(volume);

      this.weaponSounds.set(names[s], audio);
      this.weapon.add(audio);
    });
  }

  private async createThunderSounds (): Promise<void> {
    const sounds = await this.loadSounds(Config.Level.lighting);

    sounds.forEach(sound => {
      const audio = new PositionalAudio(this.listener);

      audio.setBuffer(sound);
      this.thunder.add(audio);
    });
  }

  private async createAmbientSound (): Promise<void> {
    const ambient = await Assets.Loader.loadAudio(Config.Level.ambient);
    this.ambient = new Audio(this.listener);

    this.ambient.setBuffer(ambient);
    this.ambient.autoplay = false;
    this.ambient.setLoop(true);
    this.ambient.setVolume(0);
    this.playAmbient();
  }

  private addEventListeners (): void {
    GameEvents.add('SFX:Character', this.onCharacter, true);
    GameEvents.add('SFX:Thunder', this.onThunder, true);
    GameEvents.add('SFX:Weapon', this.onWeapon, true);
    this.raf = requestAnimationFrame(this.onUpdate);
  }

  private playThuder (position: unknown): void {
    this.thunder.position.copy(position as Vector3);

    const distance = this.thunder.position.distanceToSquared(this.listener.position);
    const audioIndex = randomInt(0, this.thunder.children.length - 1);

    const thunder = this.thunder.children[audioIndex] as PositionalAudio;
    const duration = (thunder.buffer?.duration ?? 0) * 1e3;

    thunder.setRefDistance(distance / Config.Level.depth);
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

  private playCharacter (config: unknown): void {
    const { matrix, sfx } = config as CharacterSoundConfig;
    const sound = this.characterSounds.get(sfx) as PositionalAudio;

    this.character.matrixWorld.copy(matrix);
    this.character.updateMatrixWorld();
    !sound.isPlaying && sound.play();
  }

  private playWeapon (config: unknown): void {
    const { matrix, sfx, play } = config as WeaponSoundConfig;
    const sound = this.weaponSounds.get(sfx) as PositionalAudio;

    this.weapon.matrixWorld.copy(matrix);
    this.weapon.updateMatrixWorld();

    play
      ? !sound.isPlaying && sound.play()
      : sound.isPlaying && sound.stop();
  }

  public playAmbient (): void {
    this.ambient.play();

    anime({
      targets: { volume: this.ambient.getVolume() },
      update: ({ animations }) => this.ambient.setVolume(
        +animations[0].currentValue
      ),

      easing: 'linear',
      duration: 1000,
      volume: 0.25
    });
  }

  private update (): void {
    this.updateCameraState();
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.onUpdate);
  }

  private updateCameraState (): void {
    const { fov, aspect, near, far, matrix } = GameCamera.config;

    this.camera.matrixWorld.copy(matrix);
    this.camera.updateMatrixWorld();

    this.camera.aspect = aspect;
    this.camera.near = near;

    this.camera.far = far;
    this.camera.fov = fov;
  }

  public set pause (paused: boolean) {
    paused
      ? cancelAnimationFrame(this.raf)
      : this.raf = requestAnimationFrame(this.onUpdate);

    this.ambient && this.ambient[paused ? 'pause' : 'play']();
  }

  public dispose (): void {
    cancelAnimationFrame(this.raf);

    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    GameEvents.remove('SFX:Character', true);
    GameEvents.remove('SFX:Thunder', true);
    GameEvents.remove('SFX:Weapon', true);

    this.renderer.dispose();
  }
}
