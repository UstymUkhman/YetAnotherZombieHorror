type Size = { height: number, width: number, ratio: number };
type Callback = (width: number, height: number) => void;

class Viewport
{
  private readonly update = this.updateScreen.bind(this);
  private readonly callbacks: Array<Callback> = [];
  private readonly root!: CSSStyleDeclaration;
  private readonly ratio = 16.0 / 9.0;

  private height = 0.0;
  private width = 0.0;

  public constructor () {
    if (typeof window !== 'undefined') {
      this.root = document.documentElement.style;
      this.root.setProperty('--ratio', `${this.ratio}`);

      window.addEventListener('resize', this.update, false);
      this.updateScreen();
    }
  }

  private updateScreen (): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    if (this.width / this.height < this.ratio)
      this.height = this.width / this.ratio;
    else
      this.width = this.height * this.ratio;

    this.root.setProperty('--height', `${this.height}px`);
    this.root.setProperty('--width', `${this.width}px`);

    for (let c = this.callbacks.length; c--;) {
      this.callbacks[c](this.width, this.height);
    }
  }

  public addResizeCallback (callback: Callback): void {
    const index = this.callbacks.indexOf(callback);
    index === -1 && this.callbacks.push(callback);
  }

  public removeResizeCallback (callback: Callback): void {
    const index = this.callbacks.indexOf(callback);
    index !== -1 && this.callbacks.splice(index, 1);
  }

  public dispose (): void {
    window.removeEventListener('resize', this.update, false);
    this.callbacks.length = 0;
  }

  public get size (): Size {
    return {
      height: this.height,
      width: this.width,
      ratio: this.ratio
    };
  }
}

export default new Viewport();
