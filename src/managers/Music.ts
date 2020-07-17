export default class Music {
  private readonly basePath = './assets/music';
  private track: HTMLAudioElement;

  private paused = true;
  private mute = false;
  private vol = 0.1;

  public constructor (track: string) {
    this.track = new Audio(`${this.basePath}/${track}`);
    this.track.autoplay = !this.paused;
    this.track.volume = this.vol;

    this.track.muted = this.mute;
    this.track.loop = true;
    this.track.load();
  }

  private toggle (play: boolean): void {
    play ? this.track.play() : this.track.pause();
    this.paused = !play;
  }

  public play (): void {
    this.toggle(true);
  }

  public pause (): void {
    this.toggle(false);
  }

  public destroy (): void {
    this.track.currentTime = 0;
    this.toggle(false);
    delete this.track;
  }

  public set volume (volume: number) {
    this.track.volume = volume;
    this.vol = volume;
  }

  public get volume (): number {
    return this.vol;
  }

  public set muted (mute: boolean) {
    this.track.muted = mute;
    this.mute = mute;
  }

  public get muted (): boolean {
    return this.mute;
  }
}
