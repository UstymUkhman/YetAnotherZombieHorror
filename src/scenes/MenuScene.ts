import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { DirectionalLight } from 'three/src/lights/DirectionalLight';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { AmbientLight } from 'three/src/lights/AmbientLight';

import { sRGBEncoding } from 'three/src/constants';
import { Scene } from 'three/src/scenes/Scene';
import { Clock } from 'three/src/core/Clock';

import Viewport from '@/utils/Viewport';
import Enemy from '@/characters/Enemy';
import { Color } from '@/utils/Color';
import RAF from '@/managers/RAF';

export default class MenuScene
{
  private readonly clock = new Clock();
  private readonly scene = new Scene();
  private readonly enemy = new Enemy();

  private readonly renderer: WebGLRenderer;

  private readonly onRender = this.render.bind(this);
  private readonly onResize = this.resize.bind(this);

  private ratio = window.innerWidth / window.innerHeight;
  private readonly camera = new PerspectiveCamera(45, this.ratio, 1, 500);

  public constructor (canvas: HTMLCanvasElement) {
    this.scene.background = Color.getClass(Color.BLACK);
    Viewport.addResizeCallback(this.onResize);

    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: false,
      canvas
    });

    this.camera.position.set(0, 0.5, -3);
    this.camera.lookAt(0, 0, 0);

    RAF.add(this.onRender);
    this.createRenderer();
    this.createLights();
    this.createEnemy();
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
    const character = await this.enemy.loadCharacter();
    character.scene.rotation.set(0, Math.PI, 0);

    this.scene.add(character.scene);
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
