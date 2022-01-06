import type Raindrops from '@/environment/Raindrops';
import { GameEvents } from '@/events/GameEvents';
import AudioScene from '@/scenes/AudioScene';

import WebWorker from '@/worker/WebWorker';
import Pointer from '@/managers/Pointer';
import Viewport from '@/utils/Viewport';
import Music from '@/managers/Music';

import RAF from '@/managers/RAF';
import Configs from '@/configs';

export interface ApplicationManager
{
  resize (width: number, height: number): void
  set controls (disabled: boolean)
  set pause (paused: boolean)
}

export default class Application
{
  private started = false;
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

  private toggleControls (disabled: boolean) {
    this.manager.controls = disabled;
  }

  private toggleAudio (paused: boolean) {
    this.music[paused ? 'pause' : 'play']();
    this.audioScene.pause = paused;
  }

  public start (): void {
    const { width, height } = Viewport.size;
    this.audioScene.updateAmbient();
    this.resize(width, height);

    this.toggleControls(false);
    this.toggleAudio(false);

    this.raindrops?.start();
    this.started = true;
  }

  public destroy (): void {
    this.pause = true;
    RAF.dispose();

    this.music.dispose();
    this.raindrops?.dispose();

    Viewport.removeResizeCallback(this.onResize);
  }

  public set pause (paused: boolean) {
    !paused
      ? this.pointer.requestPointerLock()
      : this.pointer.exitPointerLock();

    if (this.started) {
      this.toggleControls(paused);
      this.toggleAudio(paused);
    }

    this.manager.pause = paused;
    RAF.pause = paused;
  }

  public get ready (): boolean {
    return !!this.manager;
  }
}
