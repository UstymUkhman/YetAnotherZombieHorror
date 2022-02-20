type Call = (delta?: number) => void;

class RAF
{
  private raf!: number;
  private paused = true;

  private readonly calls: Array<Call> = [];
  private readonly onUpdate = this.update.bind(this);

  public add (call: Call): void {
    const index = this.calls.indexOf(call);

    if (index === -1) {
      this.calls.push(call);
    }
  }

  private update (delta?: number): void {
    for (let c = this.calls.length; c--;) {
      this.calls[c](delta);
    }

    this.raf = requestAnimationFrame(this.onUpdate);
  }

  public remove (call: Call): void {
    const index = this.calls.indexOf(call);

    if (index !== -1) {
      this.calls.splice(index, 1);
    }
  }

  public dispose (): void {
    cancelAnimationFrame(this.raf);
    this.calls.splice(0);
  }

  public set pause (paused: boolean) {
    if (this.paused === paused) return;
    this.paused = paused;

    this.paused
      ? cancelAnimationFrame(this.raf)
      : this.raf = requestAnimationFrame(this.onUpdate);
  }
}

export default new RAF();
