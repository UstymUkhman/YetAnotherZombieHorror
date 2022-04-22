import Viewport from '@/utils/Viewport';
import Raindrop from 'raindrop-fx';

export default class Raindrops
{
  private raindrop: Raindrop;
  private readonly onResize = this.resize.bind(this);

  public constructor (private readonly canvas: HTMLCanvasElement) {
    Viewport.addResizeCallback(this.onResize);

    this.raindrop = new Raindrop({
      motionInterval: [0.25, 0.5],
      spawnInterval: [0.1, 0.5],
      spawnSize: [75.0, 100.0],

      backgroundBlurSteps: 0,
      dropletsPerSeconds: 15,
      raindropLightBump: 0.5,
      velocitySpread: 0.25,
      canvas: this.canvas,

      refractBase: 0.5,
      mistBlurStep: 0,
      spawnLimit: 50,
      evaporate: 25,
      mist: false
    });

    this.start();
  }

  private start (): void {
    this.raindrop.start().then(() => {
      this.canvas.style.opacity = '1';

      // Dirty hack to bypass the need of mandatory background blur:
      // https://github.com/SardineFish/raindrop-fx/pull/3#issuecomment-877057762

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raindropRenderer = this.raindrop?.renderer as any;
      raindropRenderer.blurryBackground = raindropRenderer.background;
    });
  }

  private resize (width: number, height: number): void {
    if (!this.canvas.style.opacity) return;
    this.raindrop.resize(width, height);

    this.canvas.height = height;
    this.canvas.width = width;
  }

  public update (canvas: HTMLCanvasElement): void {
    this.raindrop.setBackground(canvas);
  }

  public pause (paused: boolean): void {
    this.raindrop[paused ? 'stop' : 'start']();
  }

  public dispose (): void {
    Viewport.removeResizeCallback(this.onResize);
    this.raindrop.stop();
  }
}
