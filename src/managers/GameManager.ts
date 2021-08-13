// import { EventsManager, EventData } from './EventsManager';
import GameLoop from '@/managers/GameLoop';

// Hack for three.js OrbitControls:
// (self.document as unknown) = null;

class GameWorker
{
  private game!: GameLoop;
  // private events = new EventsManager();

  public takeControl (params: OffscreenParams): void {
    const canvas = params.element as unknown as HTMLCanvasElement;
    this.game = new GameLoop(canvas, params.pixelRatio);
  }

  /* public setEventTarget (data: EventData): void {
    this.events.setTarget(data);
  }

  public handleEvent (data: EventData): void {
    this.events.handleEvent(data);
  } */

  public resize (size: SizeParams): void {
    const { width, height } = size;
    this.game.resize(width, height);
  }
}

export const GameManager = new GameWorker();

export type OffscreenParams = {
  element: OffscreenCanvas,
  pixelRatio: number,
  // elementId: string
};

export type SizeParams = {
  height: number,
  width: number
};
