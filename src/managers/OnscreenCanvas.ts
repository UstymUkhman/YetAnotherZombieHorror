import type { ApplicationManager } from '@/managers/Application';
import MainLoop from '@/managers/MainLoop';

export default class OnscreenCanvas implements ApplicationManager
{
  private loop: MainLoop;

  public constructor (scene: HTMLCanvasElement, pixelRatio: number) {
    this.loop = new MainLoop(scene, pixelRatio);
  }

  public resize (width: number, height: number): void {
    this.loop.resize(width, height);
  }

  public set pause (paused: boolean) {
    this.loop.pause = paused;
  }
}
