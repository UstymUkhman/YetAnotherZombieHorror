import { GameEvents } from '@/managers/GameEvents';
import { Vector2 } from '@three/math/Vector2';
import { throttle } from 'lodash';

type Player = import('@/characters/Player').Player;
export const enum Direction { UP, RIGHT, DOWN, LEFT }
export type Directions = { [way in Direction]: number };

export default class Input {
  private readonly mousePress = throttle(this.onMousePress.bind(this), 150, { leading: true });
  private readonly pointerLockChange = this.onPointerLockChange.bind(this);
  private readonly pointerLockError = this.onPointerLockError.bind(this);

  private readonly contextMenu = this.onContextMenu.bind(this);
  private readonly mouseDown = this.onMouseDown.bind(this);
  private readonly mouseMove = this.onMouseMove.bind(this);
  private readonly mouseUp = this.onMouseUp.bind(this);

  private readonly keyDown = this.onKeyDown.bind(this);
  private readonly keyUp = this.onKeyUp.bind(this);

  private readonly rotation = new Vector2();
  private moves: Directions = [0, 0, 0, 0];

  private rightTimeout?: number;
  private idleTimeout?: number;
  private downTime?: number;

  // this._mouseDown = false;
  // this.mouseRight = null;

  private paused = true;
  private shift = false;
  private move = '0000';

  public constructor (private readonly player: Player) {
    this.addEvents();
  }

  /* private init (player: Player): void {
    this.rotation.setScalar(0);

    this.rightTimeout = undefined;
    this.idleTimeout = undefined;
    this.downTime = undefined;
    this.moves = [0, 0, 0, 0];

    // this._mouseDown = false;
    // this.mouseRight = null;
    // this.player = player;

    this.paused = true;
    this.shift = false;
    this.move = '0000';
    this.addEvents();
  } */

  private onMousePress (event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }

  private onMouseDown (event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }

  private onMouseMove (event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.paused) return;
    const { movementX, movementY } = event;

    this.rotation.set(movementX, movementY);
    this.rotation.multiplyScalar(-0.5);
  }

  private onMouseUp (event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }

  private onKeyDown (event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.paused) return;

    if (event.code === 'ShiftLeft' && this.moves[0] && !this.shift) {
      this.moves[Direction.RIGHT] = 0;
      this.moves[Direction.DOWN] = 0;
      this.moves[Direction.LEFT] = 0;

      this.player.run(this.moves, true);
      this.downTime = Date.now();
      this.shift = true;
      return;
    }

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

      default:
        return;
    }

    const move = Object.values(this.moves).join('');

    if (this.move !== move) {
      this.player.move(this.moves);
      this.downTime = Date.now();
      this.move = move;
    }
  }

  private onKeyUp (event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.paused) return;

    if (event.code === 'ShiftLeft' && this.shift) {
      setTimeout(() => { this.shift = false; }, 150);
      this.player.run(this.moves, false);
    }

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
        this.player.changeWeapon();
        return;

      // case 'KeyR':
      //   this.player.reload();
      //   return;

      default:
        return;
    }

    const move = Object.values(this.moves).join('');

    if (move === '0000') {
      setTimeout(
        this.player.idle.bind(this.player), Math.max(
          150 - (Date.now() - (this.downTime as number)), 0
        )
      );

      clearTimeout(this.idleTimeout);
      this.move = move;
      return;
    }

    if (this.move !== move) {
      this.idleTimeout = setTimeout(() => {
        this.player.move(this.moves);
        this.move = move;
      }, 100) as unknown as number;
    }
  }

  private onPointerLockChange (event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    this.paused = !this.pointerLocked;
    GameEvents.dispatch('pause', this.paused);
  }

  private onPointerLockError (event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    console.error(event);
  }

  private onContextMenu (event: Event): boolean | void {
    if (!this.paused) {
      event.stopPropagation();
      event.preventDefault();
      return false;
    }
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

  public update (): void {
    this.player.rotate(this.rotation);
    this.rotation.setScalar(0);

    // this._mouseDown && !this.player.hitting && !this.player.reloading && this._onMousePress();
  }

  public dispose (): void {
    delete this.rightTimeout;
    delete this.idleTimeout;

    // delete this.mouseRight;
    // delete this._mouseDown;
    // delete this.downTime;
    // delete this.player;
    // delete this.moves;

    this.removeEvents();
  }

  private get pointerLocked (): boolean {
    return !!document.pointerLockElement;
  }
}
