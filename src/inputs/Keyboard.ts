import type { Event } from 'three/src/core/EventDispatcher';
import EventsTarget from '@/offscreen/EventsTarget';

import type Player from '@/characters/Player';
import type { Directions } from '@/inputs';
import { Direction } from '@/inputs';
import Configs from '@/configs';

const enum BUTTON { LEFT, WHEEL, RIGHT }
const IDLING = '0000';

export default class Keyboard
{
  private readonly events = Object.entries({
    contextmenu: this.onContextMenu.bind(this),

    mousedown: this.onMouseDown.bind(this),
    mousemove: this.onMouseMove.bind(this),
    mouseup: this.onMouseUp.bind(this),

    keydown: this.onKeyDown.bind(this),
    keyup: this.onKeyUp.bind(this)
  });

  private moves: Directions = [0, 0, 0, 0];

  private aimTimeout = 0.0;
  private aimTime = 0.0;

  private paused = true;
  private shift = false;
  private move = IDLING;

  public constructor (private readonly player: Player) {
    this.addEventListeners();
  }

  private addEventListeners (): void {
    const target = Configs.worker ? EventsTarget : document;

    for (const [event, listener] of this.events) {
      target.addEventListener(event, listener, false);
    }
  }

  private onContextMenu (event: Event): boolean | void {
    if (this.paused) return;
    event.stopPropagation();
    event.preventDefault();
    return false;
  }

  private onMouseDown (event: Event | MouseEvent): void {
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

  private onMouseMove (event: Event | MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) return;
    this.player.rotate(event.movementX / -100, event.movementY / 400, 0.15);
  }

  private onMouseUp (event: Event | MouseEvent): void {
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

  private onKeyDown (event: Event | KeyboardEvent): void {
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

  private onKeyUp (event: Event | KeyboardEvent): void {
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
        return this.player.changeCamera(true);

      case 'KeyV':
        return this.player.changeCamera(false);

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

  private removeEventListeners (): void {
    const target = Configs.worker ? EventsTarget : document;

    for (const [event, listener] of this.events) {
      target.removeEventListener(event, listener, false);
    }
  }

  public dispose (): void {
    this.removeEventListeners();
    this.paused = true;
  }

  private get disabled (): boolean {
    return this.paused || !this.player.alive;
  }

  private get movement (): string {
    return (this.moves as unknown as Array<number>).join('');
  }

  public set pause (paused: boolean) {
    this.paused = paused;
  }
}
