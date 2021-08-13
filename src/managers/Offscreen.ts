import type Worker from '@/managers/worker';
// import OffscreenEvents from '@/managers/OffscreenEvents';

export default class Offscreen
{
  public constructor (scene: HTMLCanvasElement, private readonly worker: Worker, pixelRatio: number) {
    this.worker.transfer(scene.transferControlToOffscreen(), {
      elementId: 0, /* events.id, */ pixelRatio
    });
  }

  public resize (width: number, height: number): void {
    this.worker.post('resize', { width, height });
  }
}
