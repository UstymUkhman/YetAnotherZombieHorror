import type Raindrops from '@/environment/Raindrops';
import AudioScene from '@/environment/AudioScene';
import { GameEvents } from '@/events/GameEvents';

import Offscreen from '@/managers/Offscreen';
import Settings from '@/config/settings';
import Viewport from '@/utils/Viewport';
import Worker from '@/managers/worker';

export default class Application
{
  // private paused = true;
  private raindrops?: Raindrops;

  private readonly offscreen: Offscreen;
  private readonly worker = new Worker();
  private readonly audioScene: AudioScene;

  private readonly onPause = this.pause.bind(this);
  private readonly onResize = this.resize.bind(this);

  public constructor (scene: HTMLCanvasElement, raindrops: HTMLCanvasElement) {
    GameEvents.createWorkerEvents(this.worker);
    this.audioScene = new AudioScene();

    this.offscreen = new Offscreen(
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
    GameEvents.add('Game:pause', this.onPause);
    Viewport.addResizeCallback(this.onResize);
  }

  private resize (width: number, height: number): void {
    this.offscreen.resize(width, height);
  }

  // public start (): void {
  //   this.audioScene.playAmbient();
  // }

  private pause (paused: unknown): void {
    this.audioScene.pause = paused as boolean;
    // this.paused = paused as boolean;

    if (this.raindrops) {
      this.raindrops.pause = paused as boolean;
    }
  }

  public destroy (): void {
    Viewport.removeResizeCallback(this.onResize);
    this.raindrops?.dispose();
    // this.paused = true;
  }
}
