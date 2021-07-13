type Size = { width: number, height: number };
type Callback = (width: number, height: number) => void;

class Viewport
{
  public readonly ratio = RATIO;
  private width = window.innerWidth;
  private height = window.innerHeight;

  private readonly callbacks: Array<Callback> = [];
  private readonly root = document.documentElement.style;
  private readonly update = this.updateScreen.bind(this);

  public constructor () {
    window.addEventListener('resize', this.update, false);
    this.root.setProperty('--ratio', Viewport.ratio);
    this.updateScreen();
  }

  private updateScreen () {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    if (window.innerWidth / window.innerHeight < this.ratio) {
      this.height = window.innerWidth / this.ratio;
    } else {
      this.width = window.innerHeight * this.ratio;
    }

    this.root.setProperty('--width', `${this.width}px`);
    this.root.setProperty('--height', `${this.height}px`);

    for (let c = this.callbacks.length; c--;) {
      this.callbacks[c](this.width, this.height);
    }
  }

  public addResizeCallback (callback: Callback) {
    const index = this.callbacks.indexOf(callback);
    index === -1 && this.callbacks.push(callback);
  }

  public removeResizeCallback (callback: Callback) {
    const index = this.callbacks.indexOf(callback);
    index !== -1 && this.callbacks.splice(index, 1);
  }

  public dispose () {
    window.removeEventListener('resize', this.update, false);
    this.callbacks.splice(0, this.callbacks.length);
  }

  public static get ratio (): string {
    return '16 / 9';
  }

  public get size (): Size {
    return {
      width: this.width,
      height: this.height
    };
  }
}

export const RATIO = eval(Viewport.ratio);
export default new Viewport();
