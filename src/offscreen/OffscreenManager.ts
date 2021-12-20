import type { OffscreenParams, SizeParams } from '@/offscreen/types';
import type { Event } from 'three/src/core/EventDispatcher';

import EventsTarget from '@/offscreen/EventsTarget';
import MainLoop from '@/managers/MainLoop';

class OffscreenApplication
{
  private loop!: MainLoop;

  public takeControl (params: OffscreenParams): void {
    const canvas = params.element as unknown as HTMLCanvasElement;
    this.loop = new MainLoop(canvas, params.pixelRatio);
    this.resetDOMElements();
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

  public set controls (disabled: boolean) {
    this.loop.controls = disabled;
  }

  public set pause (paused: boolean) {
    this.loop.pause = paused;
  }
}

export const OffscreenManager = new OffscreenApplication();
