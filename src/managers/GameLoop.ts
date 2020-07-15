// import GameEvents from '@/managers/GameEvents';
import Level0 from '@/environment/Level0';
import Enemy from '@/characters/Enemy';

export default class GameLoop {
  private level = new Level0();
  private paused = false;
  private raf: number;

  public constructor () {
    this.raf = requestAnimationFrame(this.update.bind(this));
  }

  private loadCharacters (): void {
    new Enemy(0).load().then(
      character => this.level.addModel(character.scene)
    );
  }

  private update (): void {
    this.raf = requestAnimationFrame(this.update.bind(this));

    if (!this.paused) {
      this.level.render();
    }
  }

  public destroy (): void {
    cancelAnimationFrame(this.raf);
    this.level.destroy();
  }

  public set pause (pause: boolean) {
    this.paused = pause;
  }

  public get pause (): boolean {
    return this.paused;
  }

  public get scene (): HTMLCanvasElement {
    return this.level.canvas;
  }
}
