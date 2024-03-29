import Configs from '@/configs';

export default class Music
{
  private track: HTMLAudioElement;
  private paused = true;
  private mute = false;
  private vol = 0.05;

  public constructor () {
    const track = ''; // Configs.Level.music;
    const audio = `${Configs.basePath()}/music/${track}`;

    this.track = new Audio(audio);
    this.track.autoplay = !this.paused;
    this.track.volume = this.vol;

    this.track.muted = this.mute;
    this.track.loop = true;
    this.track.load();
  }

  public play (): void {
    this.paused = false;
    this.track.play();
  }

  public pause (): void {
    this.paused = true;
    this.track.pause();
  }

  public dispose (): void {
    this.track.currentTime = 0;
    this.pause();
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
