type Callback = (width: number, height: number) => void;
type Size = { width: number, height: number };

class Viewport
{
  private readonly update = this.updateScreen.bind(this);
  private readonly root = document.documentElement.style;
  private readonly callbacks: Array<Callback> = [];

  private height = window.innerHeight;
  private width = window.innerWidth;

  public constructor () {
    window.addEventListener('resize', this.update, false);
    this.root.setProperty('--ratio', '16 / 9');
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

    this.root.setProperty('--height', `${Math.ceil(this.height)}px`);
    this.root.setProperty('--width', `${Math.ceil(this.width)}px`);

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

  public get ratio (): number {
    return 16 / 9;
  }

  public get size (): Size {
    return {
      height: this.height,
      width: this.width
    };
  }
}

export default new Viewport();
