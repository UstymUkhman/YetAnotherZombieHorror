import Viewport from '@/utils/Viewport';
import Raindrop from 'raindrop-fx';
import RAF from '@/managers/RAF';

export default class Raindrops
{
  private raindrops: Raindrop;

  private readonly onUpdate = this.update.bind(this);
  private readonly onResize = this.resize.bind(this);

  public constructor (
    private readonly background: HTMLCanvasElement,
    private readonly canvas: HTMLCanvasElement
  ) {
    RAF.add(this.onUpdate);
    Viewport.addResizeCallback(this.onResize);

    this.raindrops = new Raindrop({
      background: this.background,
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

    this.raindrops.start().then(() => {
      // Dirty hack to bypass the need of mandatory background blur:
      // https://github.com/SardineFish/raindrop-fx/pull/3#issuecomment-877057762

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raindropsRenderer = this.raindrops?.renderer as any;
      raindropsRenderer.blurryBackground = raindropsRenderer.background;
    });
  }

  private update (): void {
    this.raindrops.setBackground(this.background);
  }

  private resize (width: number, height: number): void {
    this.raindrops.resize(width, height);
    this.canvas.height = height;
    this.canvas.width = width;
  }

  public dispose (): void {
    Viewport.removeResizeCallback(this.onResize);
    RAF.remove(this.onUpdate);
    this.raindrops.stop();
  }
}
