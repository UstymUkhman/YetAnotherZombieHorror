import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { PositionalAudio } from 'three/src/audio/PositionalAudio';

import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { AudioListener } from 'three/src/audio/AudioListener';
import { AmbientLight } from 'three/src/lights/AmbientLight';

import { sRGBEncoding } from 'three/src/constants';
import { GameEvents } from '@/events/GameEvents';
import { Assets } from '@/loaders/AssetsLoader';
import MenuEnemy from '@/characters/MenuEnemy';

import { Scene } from 'three/src/scenes/Scene';
import { Clock } from 'three/src/core/Clock';
import Viewport from '@/utils/Viewport';
import { Color } from '@/utils/Color';

import RAF from '@/managers/RAF';
import Configs from '@/configs';
import anime from 'animejs';

export default class MenuScene
{
  private readonly clock = new Clock();
  private readonly scene = new Scene();

  private readonly renderer: WebGLRenderer;
  private readonly enemy = new MenuEnemy();
  private readonly listener = new AudioListener();

  private readonly onRender = this.render.bind(this);
  private readonly onResize = this.resize.bind(this);

  private ratio = window.innerWidth / window.innerHeight;
  private readonly scream = new PositionalAudio(this.listener);
  private readonly camera = new PerspectiveCamera(45, this.ratio, 1, 500);

  public constructor (canvas: HTMLCanvasElement) {
    this.scene.background = Color.getClass(Color.BLACK);
    Viewport.addResizeCallback(this.onResize);

    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: false,
      canvas
    });

    this.camera.rotation.set(0, Math.PI, 0);
    this.camera.position.set(0.7, 0.1, -3);

    this.camera.add(this.listener);
    RAF.add(this.onRender);

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

  public rotateCamera (left = false): void {
    anime({
      targets: this.camera.rotation,
      y: Math.PI + +left * -0.5,
      easing: 'easeInOutQuad',
      duration: 500
    });
  }

  public playScreamAnimation (): void {
    this.scream.play(0.25);
    this.enemy.scream();
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

    GameEvents.dispatch('MenuScene::Loaded');
    this.scene.add(character.scene);

    this.enemy.fade(true);
    RAF.pause = false;
  }

  private render (): void {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.renderer.render(this.scene, this.camera);
    this.enemy.update(delta);
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
    while (this.scene.children.length > 0)
      this.scene.remove(this.scene.children[0]);

    Viewport.removeResizeCallback(this.onResize);
    RAF.remove(this.onRender);

    this.renderer.dispose();
    this.enemy.dispose();
    this.scene.clear();
  }
}
