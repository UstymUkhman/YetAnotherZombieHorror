import { GameEvents } from '@/managers/GameEvents';
import { Elastic /*, clamp */ } from '@/utils/Number';
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

  private moves: Directions = [0, 0, 0, 0];

  private rotationX = new Elastic(0);
  private rotationY = new Elastic(0);

  private rightTimeout?: number;
  private idleTimeout?: number;

  // this._mouseDown = false;
  // this.mouseRight = null;
  // this._keyDown = null;
  // this.player = null;

  private paused = true;
  private shift = false;
  private move = '0000';

  public constructor (private player: Player) {
    this.rotationX.speed = 15;
    this.addEvents();
  }

  /* private init (): void {
    this.rotationX = new Elastic(0);
    this.rotationY = new Elastic(0);
    this.rotationX.speed = 15;

    this.rightTimeout = undefined;
    this.idleTimeout = undefined;
    this.moves = [0, 0, 0, 0];

    // this._mouseDown = false;
    // this.mouseRight = null;
    // this._keyDown = null;
    // this.player = null;

    this.paused = true;
    this.shift = false;
    this.move = '0000';
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
    event.stopPropagation();
    event.preventDefault();
  }

  private onMouseUp (event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }

  private onKeyDown (event: KeyboardEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }

  private onKeyUp (event: KeyboardEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }

  private onPointerLockChange (event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const isPaused = this.paused;
    this.paused = !this.pointerLocked;

    if (this.paused !== isPaused) {
      GameEvents.dispatch('pause', this.paused);
    }
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

  public update (delta: number): void {
    // if (!this.player.alive) return;

    this.rotationX.update(delta);
    this.rotationY.update(delta);

    // this.player.character.rotation.y = this.rotationX.value;
    // this.character.rotation.x = this.rotationY.value;
    // this.camera.rotation.x = this.rotationY.value;

    // this._mouseDown && !this.player.hitting && !this.player.reloading && this._onMousePress();
  }

  public dispose (): void {
    delete this.rightTimeout;
    delete this.idleTimeout;

    // delete this.mouseRight;
    // delete this._mouseDown;
    // delete this._keyDown;
    // delete this.player;
    // delete this.moves;

    this.removeEvents();
  }

  private get pointerLocked (): boolean {
    return !!document.pointerLockElement;
  }
}
