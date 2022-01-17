import type { ApplicationManager } from '@/managers/Application';
import type WebWorker from '@/worker/WebWorker';
import MainLoop from '@/managers/MainLoop';

export default class Onscreen implements ApplicationManager
{
  private loop: MainLoop;

  public constructor (scene: HTMLCanvasElement, worker: WebWorker, pixelRatio: number) {
    this.loop = new MainLoop(scene, pixelRatio, worker);
  }

  public resize (width: number, height: number): void {
    this.loop.resize(width, height);
  }

  public set inputs (disabled: boolean) {
    this.loop.inputs = disabled;
  }

  public set pause (paused: boolean) {
    this.loop.pause = paused;
  }
}
