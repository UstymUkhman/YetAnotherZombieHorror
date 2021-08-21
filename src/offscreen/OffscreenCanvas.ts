import type WebWorker from '@/worker/WebWorker';
import OffscreenEvents from './OffscreenEvents';

export default class OffscreenCanvas
{
  public constructor (scene: HTMLCanvasElement, private readonly worker: WebWorker, pixelRatio: number) {
    new OffscreenEvents(this.worker);

    this.worker.transfer(
      scene.transferControlToOffscreen(), {
      pixelRatio
    });
  }

  public resize (width: number, height: number): void {
    this.worker.post('Game::Resize', { width, height });
  }

  public set pause (paused: boolean) {
    this.worker.post('Game::Pause', { paused });
  }
}
