import type Raindrops from '@/environment/Raindrops';
import AudioScene from '@/environment/AudioScene';
import { GameEvents } from '@/events/GameEvents';

import WebWorker from '@/worker/WebWorker';
import Pointer from '@/managers/Pointer';
import Viewport from '@/utils/Viewport';

import Music from '@/managers/Music';
import RAF from '@/managers/RAF';
import Configs from '@/configs';

export interface ApplicationManager
{
  resize (width: number, height: number): void,
  set pause (paused: boolean)
}

export default class Application
{
  private raindrops?: Raindrops;
  private manager!: ApplicationManager;

  private readonly music = new Music();
  private readonly audioScene: AudioScene;

  private readonly pointer = new Pointer();
  private readonly worker = new WebWorker();

  private readonly onResize = this.resize.bind(this);

  public constructor (scene: HTMLCanvasElement, raindrops?: HTMLCanvasElement) {
    const pixelRatio = window.devicePixelRatio || 1.0;

    GameEvents.createWorkerEvents(this.worker);
    Viewport.addResizeCallback(this.onResize);
    this.audioScene = new AudioScene();

    import(Configs.offscreen ? '@/offscreen/OffscreenCanvas' : '@/managers/Onscreen').then(Manager =>
      this.manager = new Manager.default(scene, this.worker, pixelRatio)
    );

    raindrops && this.createRaindrops(scene, raindrops);
  }

  private async createRaindrops (scene: HTMLCanvasElement, canvas: HTMLCanvasElement): Promise<void> {
    const Raindrops = await import('@/environment/Raindrops');
    this.raindrops = new Raindrops.default(scene, canvas);
  }

  private resize (width: number, height: number): void {
    this.manager.resize(width, height);
  }

  public start (): void {
    const { width, height } = Viewport.size;
    this.audioScene.updateAmbient();
    this.resize(width, height);
    this.raindrops?.start();
  }

  public destroy (): void {
    this.pause = true;
    RAF.dispose();

    this.music.dispose();
    this.raindrops?.dispose();
    Viewport.removeResizeCallback(this.onResize);
  }

  public set pause (paused: boolean) {
    this.music[paused ? 'pause' : 'play']();

    paused
      ? this.pointer.exitPointerLock()
      : this.pointer.requestPointerLock();

    this.audioScene.pause = paused;
    this.manager.pause = paused;

    RAF.pause = paused;
  }

  public get ready (): boolean {
    return !!this.manager;
  }
}
