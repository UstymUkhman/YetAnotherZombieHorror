import OffscreenCanvas from '@/offscreen/OffscreenCanvas';
import type Raindrops from '@/environment/Raindrops';

import AudioScene from '@/environment/AudioScene';
import { GameEvents } from '@/events/GameEvents';

import WebWorker from '@/worker/WebWorker';
import Settings from '@/config/settings';

import Pointer from '@/managers/Pointer';
import Viewport from '@/utils/Viewport';

import Music from '@/managers/Music';
import RAF from '@/managers/RAF';

export default class Application
{
  private raindrops?: Raindrops;
  private readonly music = new Music();
  private readonly audioScene: AudioScene;

  private readonly pointer = new Pointer();
  private readonly worker = new WebWorker();

  private readonly offscreen: OffscreenCanvas;
  private readonly onResize = this.resize.bind(this);

  public constructor (scene: HTMLCanvasElement, raindrops: HTMLCanvasElement) {
    GameEvents.createWorkerEvents(this.worker);
    Viewport.addResizeCallback(this.onResize);

    this.audioScene = new AudioScene();

    this.offscreen = new OffscreenCanvas(
      scene, this.worker, window.devicePixelRatio || 1.0
    );

    if (Settings.raindrops) {
      this.createRaindrops(scene, raindrops);
    }
  }

  private async createRaindrops (scene: HTMLCanvasElement, canvas: HTMLCanvasElement): Promise<void> {
    const Raindrops = await import('@/environment/Raindrops');
    this.raindrops = new Raindrops.default(scene, canvas);
  }

  private resize (width: number, height: number): void {
    this.offscreen.resize(width, height);
  }

  public start (): void {
    this.audioScene.playAmbient();
    this.pause = false;
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
    this.offscreen.pause = paused;

    RAF.pause = paused;
  }
}
