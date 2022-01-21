import type { ApplicationManager } from '@/managers/Application';
import OffscreenEvents from '@/offscreen/OffscreenEvents';
import type WebWorker from '@/worker/WebWorker';
import type Configs from '@/configs';

export default class OffscreenCanvas implements ApplicationManager
{
  private readonly events: OffscreenEvents;

  public constructor (scene: HTMLCanvasElement, private readonly worker: WebWorker, pixelRatio: number) {
    this.events = new OffscreenEvents(this.worker);

    this.worker.transfer((
        scene as Configs.OffscreenCanvas
      ).transferControlToOffscreen(), { pixelRatio }
    );
  }

  public resize (width: number, height: number): void {
    this.worker.post('Game::Resize', { width, height });
  }

  public set inputs (disabled: boolean) {
    this.worker.post('Game::Inputs', { disabled });
  }

  public set pause (paused: boolean) {
    this.worker.post('Game::Pause', { paused });
  }

  public dispose(): void {
    this.worker.post('Game::Dispose');
    this.events.dispose();
  }
}
