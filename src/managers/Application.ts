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
  set inputs (disabled: boolean)
  set pause (paused: boolean)
  dispose (): void
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

  private readonly onUpdate = this.update.bind(this);
  private readonly onResize = this.resize.bind(this);

  public constructor (private readonly scene: HTMLCanvasElement) {
    const pixelRatio = window.devicePixelRatio || 1.0;

    GameEvents.createWorkerEvents(this.worker);
    Viewport.addResizeCallback(this.onResize);
    this.audioScene = new AudioScene();

    import(Configs.offscreen ? '@/offscreen/OffscreenCanvas' : '@/managers/Onscreen').then(Manager =>
      this.manager = new Manager.default(this.scene, this.worker, pixelRatio)
    );
  }

  private createRaindrops (canvas?: HTMLCanvasElement): void {
    canvas && import('@/environment/Raindrops').then(Raindrops => {
      this.raindrops = new Raindrops.default(canvas);
      RAF.add(this.onUpdate);
    });
  }

  public start (camera?: HTMLCanvasElement): void {
    const { width, height } = Viewport.size;

    this.audioScene.updateAmbient();
    this.createRaindrops(camera);
    this.resize(width, height);

    this.toggleInputs(false);
    this.toggleAudio(false);
    this.started = true;
  }

  private update (): void {
    (this.raindrops as Raindrops).update(this.scene);
  }

  private resize (width: number, height: number): void {
    this.manager.resize(width, height);
  }

  private toggleInputs (disabled: boolean) {
    this.manager.inputs = disabled;
  }

  private toggleAudio (paused: boolean) {
    this.music[paused ? 'pause' : 'play']();
    this.audioScene.pause = paused;
  }

  private toggleRain (paused: boolean) {
    RAF[paused ? 'remove' : 'add'](this.onUpdate);
  }

  public dispose (): void {
    RAF.dispose();
    this.pause = true;
    this.started = false;

    Viewport.removeResizeCallback(this.onResize);

    this.audioScene.dispose();
    this.raindrops?.dispose();
    this.manager?.dispose();

    this.pointer.dispose();
    this.worker.dispose();
    this.music.dispose();

    delete this.raindrops;
    GameEvents.dispose();
  }

  public set pause (paused: boolean) {
    !paused
      ? this.pointer.requestPointerLock()
      : this.pointer.exitPointerLock();

    if (this.started) {
      this.toggleInputs(paused);
      this.toggleAudio(paused);
      this.toggleRain(paused);
    }

    this.raindrops?.pause(paused);
    this.manager.pause = paused;
    RAF.pause = paused;
  }

  public get ready (): boolean {
    return !!this.manager;
  }
}
