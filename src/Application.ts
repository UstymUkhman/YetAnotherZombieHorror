import OffscreenCanvas from '@/offscreen/OffscreenCanvas';
import type Raindrops from '@/environment/Raindrops';

import AudioScene from '@/environment/AudioScene';
import { GameEvents } from '@/events/GameEvents';

import WebWorker from '@/worker/WebWorker';
import Settings from '@/config/settings';
import Viewport from '@/utils/Viewport';

export default class Application
{
  private paused = true;
  private started = false;
  private raindrops?: Raindrops;

  private readonly audioScene: AudioScene;
  private readonly worker = new WebWorker();
  private readonly offscreen: OffscreenCanvas;

  // private readonly onPause = this.pause.bind(this);
  private readonly onResize = this.resize.bind(this);

  public constructor (scene: HTMLCanvasElement, raindrops: HTMLCanvasElement) {
    GameEvents.createWorkerEvents(this.worker);
    this.audioScene = new AudioScene();

    this.offscreen = new OffscreenCanvas(
      scene, this.worker, window.devicePixelRatio || 1.0
    );

    if (Settings.raindrops) {
      this.createRaindrops(scene, raindrops);
    }

    this.addEventListeners();
  }

  private async createRaindrops (scene: HTMLCanvasElement, canvas: HTMLCanvasElement): Promise<void> {
    const Raindrops = await import('@/environment/Raindrops');
    this.raindrops = new Raindrops.default(scene, canvas);
  }

  private addEventListeners (): void {
    GameEvents.add('Game::Pause', () => this.pause = true);
    Viewport.addResizeCallback(this.onResize);
  }

  private resize (width: number, height: number): void {
    this.offscreen.resize(width, height);
  }

  private start (): void {
    this.audioScene.playAmbient();
    this.started = true;
  }

  public destroy (): void {
    this.pause = true;
    this.raindrops?.dispose();

    GameEvents.remove('Game::Pause');
    Viewport.removeResizeCallback(this.onResize);
  }

  public set pause (paused: boolean) {
    if (this.raindrops) {
      this.raindrops.pause = paused;
    }

    if (!this.started && !paused) {
      this.start();
    }

    this.audioScene.pause = paused;
    this.paused = paused;
  }

  public get pause (): boolean {
    return this.paused;
  }
}
