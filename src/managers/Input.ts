export type Directions = { [way in Direction]: number };
export const enum Direction { UP, RIGHT, DOWN, LEFT }

import { GameEvents } from '@/managers/GameEvents';
import type Player from '@/characters/Player';

const enum BUTTON { LEFT, WHEEL, RIGHT }
const IDLING = '0000';

export default class Input
{
  private readonly pointerLockChange = this.onPointerLockChange.bind(this);
  private readonly pointerLockError = this.onPointerLockError.bind(this);

  private readonly contextMenu = this.onContextMenu.bind(this);
  private readonly mouseDown = this.onMouseDown.bind(this);
  private readonly mouseMove = this.onMouseMove.bind(this);
  private readonly mouseUp = this.onMouseUp.bind(this);

  private readonly keyDown = this.onKeyDown.bind(this);
  private readonly keyUp = this.onKeyUp.bind(this);

  private moves: Directions = [0, 0, 0, 0];

  private aimTimeout = 0.0;
  private aimTime = 0.0;

  private paused = true;
  private shift = false;
  private move = IDLING;

  public constructor (private readonly player: Player) {
    this.addEvents();
  }

  private onMouseDown (event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) return;

    if (event.button === BUTTON.LEFT) {
      this.player.startShooting();
    }

    else if (event.button === BUTTON.RIGHT) {
      this.player.startAiming();
      this.aimTime = Date.now();
    }
  }

  private onMouseMove (event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) return;
    this.player.rotate(event.movementX / -100, event.movementY / 400, 0.15);
  }

  private onMouseUp (event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) return;

    if (event.button === BUTTON.LEFT) {
      this.player.stopShooting();
    }

    else if (event.button === BUTTON.RIGHT) {
      clearTimeout(this.aimTimeout);

      this.aimTimeout = setTimeout(() => {
        this.player.stopAiming();

        this.shift && this.moves[Direction.UP]
          ? this.player.run(this.moves, true)
          : this.player.move(this.moves);
      }, Math.max(150 - (Date.now() - this.aimTime), 0)) as unknown as number;
    }
  }

  private onKeyDown (event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) return;
    this.onShift(event.code, true);

    switch (event.code) {
      case 'KeyW':
        this.moves[Direction.UP] = 1;
        this.moves[Direction.DOWN] = 0;
        break;

      case 'KeyD':
        this.moves[Direction.RIGHT] = 1;
        this.moves[Direction.LEFT] = 0;
        break;

      case 'KeyS':
          this.moves[Direction.DOWN] = 1;
          this.moves[Direction.UP] = 0;
          break;

      case 'KeyA':
        this.moves[Direction.RIGHT] = 0;
        this.moves[Direction.LEFT] = 1;
        break;

      default: return;
    }

    const move = this.movement;

    if (this.move !== move)
      this.player.move(this.moves);

    this.move = move;
  }

  private onKeyUp (event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) return;
    this.onShift(event.code, false);

    switch (event.code) {
      case 'KeyW':
        this.moves[Direction.UP] = 0;
        break;

      case 'KeyD':
        this.moves[Direction.RIGHT] = 0;
        break;

      case 'KeyS':
        this.moves[Direction.DOWN] = 0;
        break;

      case 'KeyA':
        this.moves[Direction.LEFT] = 0;
        break;

      case 'KeyQ':
      case 'KeyE':
        return this.player.changeWeapon();

      case 'KeyC':
        return this.player.changeCamera();

      case 'KeyR':
        return this.player.reload(() => ({
          directions: this.moves,
          running: this.shift
        }));

      default: return;
    }

    const move = this.movement;

    if (move === IDLING)
      this.player.idle();

    else if (this.move !== move)
      this.player.move(this.moves);

    this.move = move;
  }

  private onShift (code: string, down: boolean): void {
    const shift = down ? !this.shift : this.shift;

    if (code === 'ShiftLeft' && shift) {
      this.player.run(this.moves, down);
      this.shift = down;
    }
  }

  private onPointerLockChange (event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    this.paused = !this.pointerLocked;
    GameEvents.dispatch('game:pause', this.paused);
  }

  private onPointerLockError (event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    console.error(event);
  }

  private onContextMenu (event: Event): boolean | void {
    if (this.paused) return;
    event.stopPropagation();
    event.preventDefault();
    return false;
  }

  private addEvents (): void {
    document.addEventListener('pointerlockchange', this.pointerLockChange, false);
    document.addEventListener('pointerlockerror', this.pointerLockError, false);

    document.addEventListener('contextmenu', this.contextMenu, false);
    document.addEventListener('mousedown', this.mouseDown, false);
    document.addEventListener('mousemove', this.mouseMove, false);
    document.addEventListener('mouseup', this.mouseUp, false);

    document.addEventListener('keydown', this.keyDown, false);
    document.addEventListener('keyup', this.keyUp, false);
  }

  private removeEvents (): void {
    document.removeEventListener('pointerlockchange', this.pointerLockChange, false);
    document.removeEventListener('pointerlockerror', this.pointerLockError, false);

    document.removeEventListener('contextmenu', this.contextMenu, false);
    document.removeEventListener('mousedown', this.mouseDown, false);
    document.removeEventListener('mousemove', this.mouseMove, false);
    document.removeEventListener('mouseup', this.mouseUp, false);

    document.removeEventListener('keydown', this.keyDown, false);
    document.removeEventListener('keyup', this.keyUp, false);
  }

  public requestPointerLock (): void {
    document.documentElement.requestPointerLock();
  }

  public exitPointerLock (): void {
    document.exitPointerLock();
  }

  public dispose (): void {
    this.removeEvents();
  }

  private get pointerLocked (): boolean {
    return !!document.pointerLockElement;
  }

  private get disabled (): boolean {
    return this.paused || !this.player.alive;
  }

  private get movement (): string {
    return (this.moves as unknown as Array<number>).join('');
  }
}
