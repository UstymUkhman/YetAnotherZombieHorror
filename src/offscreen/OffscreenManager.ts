import type { OffscreenParams, SizeParams } from '@/offscreen/types';
import type { Event } from 'three/src/core/EventDispatcher';

import EventsTarget from '@/offscreen/EventsTarget';
import { GameEvents } from '@/events/GameEvents';

import MainLoop from '@/managers/MainLoop';
import Settings from '@/settings';

class OffscreenManager
{
  private loop!: MainLoop;

  public takeControl (params: OffscreenParams): void {
    const canvas = params.element as unknown as HTMLCanvasElement;

    GameEvents.add('Game::SettingsInit', () =>
      this.createMainLoop(canvas, params.pixelRatio)
    );

    this.resetDOMElements();
    new Settings();
  }

  private createMainLoop (canvas: HTMLCanvasElement, pixelRatio: number): void {
    this.loop = new MainLoop(canvas, pixelRatio);
    GameEvents.remove('Game::SettingsInit');
  }

  private resetDOMElements (): void {
    const workerScope = self.DedicatedWorkerGlobalScope;

    (self.HTMLCollection as unknown) = workerScope;
    (self.SVGElement as unknown) = workerScope;
    (self.NodeList as unknown) = workerScope;

    (self.document as unknown) = null;
    (self.window as unknown) = self;
  }

  public dispatch (event: Event): void {
    EventsTarget.dispatchEvent(event);
  }

  public resize (size: SizeParams): void {
    const { width, height } = size;
    this.loop.resize(width, height);
  }

  public dispose (): void {
    this.loop.dispose();
  }

  public set inputs (disabled: boolean) {
    this.loop.inputs = disabled;
  }

  public set pause (paused: boolean) {
    this.loop.pause = paused;
  }
}

export default new OffscreenManager();
