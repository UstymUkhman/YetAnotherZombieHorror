import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { PositionalAudio } from 'three/src/audio/PositionalAudio';

import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { AudioListener } from 'three/src/audio/AudioListener';
import { AmbientLight } from 'three/src/lights/AmbientLight';

import { sRGBEncoding } from 'three/src/constants';
import { GameEvents } from '@/events/GameEvents';
import { Assets } from '@/loaders/AssetsLoader';

import { Scene } from 'three/src/scenes/Scene';
import { Clock } from 'three/src/core/Clock';

import Zombie from '@/characters/Zombie';
import Viewport from '@/utils/Viewport';
import { Color } from '@/utils/Color';

import Configs from '@/configs';
import anime from 'animejs';

export default class MenuScene
{
  private frame = 0.0;

  private readonly clock = new Clock();
  private readonly scene = new Scene();
  private readonly enemy = new Zombie();

  private readonly renderer: WebGLRenderer;
  private readonly listener = new AudioListener();

  private readonly onRender = this.render.bind(this);
  private readonly onResize = this.resize.bind(this);

  private ratio = window.innerWidth / window.innerHeight;
  private readonly scream = new PositionalAudio(this.listener);
  private readonly camera = new PerspectiveCamera(45, this.ratio, 1, 500);

  public constructor (canvas: HTMLCanvasElement) {
    this.scene.background = Color.getClass(Color.BLACK);
    Viewport.addResizeCallback(this.onResize);

    this.camera.rotation.set(0, Math.PI, 0);
    this.camera.position.set(0.7, 0.1, -3);
    this.camera.add(this.listener);

    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas
    });

    this.loadScreamSound();
    this.createRenderer();
    this.createLights();
    this.createEnemy();
  }

  private async loadScreamSound (): Promise<void> {
    const { scream } = Configs.Enemy.sounds;
    const sound = await Assets.Loader.loadAudio(scream);

    this.scream.setBuffer(sound);
    this.scream.setVolume(0.5);
    this.scream.setLoop(false);
  }

  public rotateCamera (y = 0, duration = 500): void {
    anime({
      targets: this.camera.rotation,
      easing: 'easeInOutQuad',
      y: Math.PI + y,
      duration
    });
  }

  public playScreamAnimation (): void {
    this.rotateCamera(-0.25, 250);

    setTimeout(() => {
      this.scream.play(0.25);
      this.enemy.scream();
    }, 100);
  }

  private createRenderer (): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const ratio = window.devicePixelRatio;

    this.renderer.setClearColor(Color.BLACK, 1);
    this.renderer.outputEncoding = sRGBEncoding;

    this.renderer.setPixelRatio(ratio || 1.0);
    this.renderer.shadowMap.enabled = false;
    this.renderer.setSize(width, height);
  }

  private createLights (): void {
    const directional = new DirectionalLight(Color.WHITE, 0.1);
    const ambient = new AmbientLight(Color.WHITE);

    directional.position.set(-5, 10, 25);

    this.scene.add(directional);
    this.scene.add(ambient);
  }

  private async createEnemy (): Promise<void> {
    const character = await this.enemy.load();

    this.frame = requestAnimationFrame(this.onRender);
    GameEvents.dispatch('MenuScene::Loaded');

    this.scene.add(character.scene);
    this.enemy.fade(true);
  }

  private render (): void {
    this.frame = requestAnimationFrame(this.onRender);
    this.renderer.render(this.scene, this.camera);
    this.enemy.update(this.clock.getDelta());
  }

  private resize (): void {
    const height = window.innerHeight;
    const width = window.innerWidth;

    this.ratio = width / height;
    this.camera.aspect = this.ratio;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose (): void {
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    Viewport.removeResizeCallback(this.onResize);
    cancelAnimationFrame(this.frame);

    this.renderer.dispose();
    this.enemy.dispose();
    this.scene.clear();
  }

  public set freeze (frozen: boolean) {
    this.enemy.freeze = frozen;
  }
}
