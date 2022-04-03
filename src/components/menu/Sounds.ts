import Configs from '@/configs';

export default class Sounds
{
  private static vol = 0.5;

  private static readonly hover = new Audio(
    `${Configs.BASE_PATH}/assets/sounds/${Configs.Rifle.sounds.empty}`
  );

  private static readonly click = new Audio(
    `${Configs.BASE_PATH}/assets/sounds/${Configs.Rifle.sounds.pick}`
  );

  public static set volume (volume: number) {
    Sounds.hover.volume = Sounds.click.volume = volume;
    Sounds.vol = volume;
  }

  public static get volume (): number {
    return Sounds.vol;
  }

  public static onHover (): void {
    const ended = Sounds.hover.ended;
    const paused = Sounds.hover.paused;
    const played = Sounds.hover.currentTime > 0.2;

    if (!ended && !paused && !played) return;
    Sounds.hover.currentTime = 0;
    Sounds.hover.play();
  }

  public static onClick (): void {
    Sounds.click.currentTime = 0;
    Sounds.click.play();
  }

  public static mute (): void {
    Sounds.volume = 0.0;
  }

  public static load (): void {
    Sounds.hover.volume = Sounds.vol;
    Sounds.click.volume = Sounds.vol;

    Sounds.hover.load();
    Sounds.click.load();
  }
}

Sounds.load();
