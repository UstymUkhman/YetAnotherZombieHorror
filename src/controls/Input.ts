import { type Directions, IDLING } from '@/controls';
import type Player from '@/characters/Player';

export default abstract class Input
{
  private static readonly directions: Directions = [0, 0, 0, 0];
  protected abstract aimTimeout: NodeJS.Timeout;

  protected abstract aimTime: number;
  protected static running = false;

  protected paused = true;
  protected move = IDLING;

  public constructor (protected readonly player: Player) {}

  public static get moves (): Directions {
    return Input.directions;
  }

  public static get moving (): boolean {
    return (Input.directions as unknown as Array<number>).includes(1);
  }

  public static get idle (): boolean {
    return !Input.moving;
  }

  public static get runs (): boolean {
    return Input.running;
  }

  protected static set runs (runs: boolean) {
    Input.running = runs;
  }

  protected get disabled (): boolean {
    return this.paused || !this.player.alive;
  }

  public set pause (paused: boolean) {
    this.paused = paused;
  }

  protected get movement (): string {
    return (Input.moves as unknown as Array<number>).join('');
  }

  public dispose (): void {
    this.paused = true;
  }
}
