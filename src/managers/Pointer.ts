import { GameEvents } from '@/events/GameEvents';

export default class Pointer
{
  private readonly lockChange = this.onLockChange.bind(this);
  private readonly lockError = this.onLockError.bind(this);

  public constructor () {
    document.addEventListener('pointerlockchange', this.lockChange, false);
    document.addEventListener('pointerlockerror', this.lockError, false);
  }

  private onLockChange (event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    !this.locked && GameEvents.dispatch('Game::Pause', false);
  }

  private onLockError (event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    console.error(event);
  }

  public requestPointerLock (): void {
    document.documentElement.requestPointerLock();
  }

  public exitPointerLock (): void {
    document.exitPointerLock();
  }

  public dispose (): void {
    document.removeEventListener('pointerlockchange', this.lockChange, false);
    document.removeEventListener('pointerlockerror', this.lockError, false);
  }

  private get locked (): boolean {
    return !!document.pointerLockElement;
  }
}
