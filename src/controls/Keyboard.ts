import type { Event } from 'three/src/core/EventDispatcher';
import { Direction, BUTTON, IDLING } from '@/controls';
import EventsTarget from '@/offscreen/EventsTarget';

import type Player from '@/characters/Player';
import Input from '@/controls/Input';
import Configs from '@/configs';

export default class Keyboard extends Input
{
  private wheelTime = 0.0;
  protected override aimTime = 0.0;
  protected override aimTimeout!: NodeJS.Timeout;

  private readonly events = Object.entries({
    contextmenu: this.onContextMenu.bind(this),
    mousewheel: this.onMouseWheel.bind(this),

    mousedown: this.onMouseDown.bind(this),
    mousemove: this.onMouseMove.bind(this),
    mouseup: this.onMouseUp.bind(this),

    keydown: this.onKeyDown.bind(this),
    keyup: this.onKeyUp.bind(this)
  });

  public constructor (player: Player) {
    super(player);
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

  private onMouseWheel (event: Event | WheelEvent): void {
    const now = Date.now();
    event.stopPropagation();

    if (!this.disabled && now > this.wheelTime) {
      this.wheelTime = now + 450.0;
      this.player.changeWeapon();
    }
  }

  private onMouseDown (event: Event | MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) return;

    if (event.button === BUTTON.LEFT)
      this.player.startShooting();

    else if (event.button === BUTTON.RIGHT) {
      const updateAnimation = this.move !== IDLING;
      this.player.startAiming(updateAnimation);
      this.aimTime = Date.now();
    }
  }

  private onMouseMove (event: Event | MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) return;

    this.player.rotate(
      event.movementX / -100,
      event.movementY / 400,
      0.15
    );
  }

  private onMouseUp (event: Event | MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) return;

    if (event.button === BUTTON.LEFT)
      this.player.stopShooting();

    else if (event.button === BUTTON.RIGHT) {
      clearTimeout(this.aimTimeout);

      this.aimTimeout = setTimeout(() => {
        const forward = !!Input.moves[Direction.UP];
        const running = Input.runs && forward;
        this.player.stopAiming(running);

        !running
          ? this.player.move()
          : this.player.run(true);
      }, Math.max(450 - (Date.now() - this.aimTime), 0));
    }
  }

  private onKeyDown (event: Event | KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) return;
    this.onShift(event.code, true);

    switch (event.code) {
      case 'KeyW':
        Input.moves[Direction.UP] = 1;
        Input.moves[Direction.DOWN] = 0;
        break;

      case 'KeyD':
        Input.moves[Direction.RIGHT] = 1;
        Input.moves[Direction.LEFT] = 0;
        break;

      case 'KeyS':
          Input.moves[Direction.DOWN] = 1;
          Input.moves[Direction.UP] = 0;
          break;

      case 'KeyA':
        Input.moves[Direction.RIGHT] = 0;
        Input.moves[Direction.LEFT] = 1;
        break;

      default: return;
    }

    const move = this.movement;

    if (this.move !== move)
      this.player.move();

    this.move = move;
  }

  private onKeyUp (event: Event | KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) return;
    this.onShift(event.code, false);

    switch (event.code) {
      case 'KeyW':
        Input.moves[Direction.UP] = 0;
        break;

      case 'KeyD':
        Input.moves[Direction.RIGHT] = 0;
        break;

      case 'KeyS':
        Input.moves[Direction.DOWN] = 0;
        break;

      case 'KeyA':
        Input.moves[Direction.LEFT] = 0;
        break;

      case 'KeyQ':
      case 'KeyE': {
        const now = Date.now();

        if (now > this.wheelTime) {
          this.wheelTime = now + 450;
          this.player.changeWeapon();
        }

        return;
      }

      case 'KeyC':
        return this.player.changeCamera(true);

      case 'KeyV':
        return this.player.changeCamera(false);

      case 'KeyR':
        return this.player.reload();

      default: return;
    }

    const move = this.movement;

    if (move === IDLING)
      this.player.idle();

    else if (this.move !== move)
      this.player.move();

    this.move = move;
  }

  private onShift (code: string, down: boolean): void {
    const shift = down ? !Input.runs : Input.runs;

    if (code === 'ShiftLeft' && shift) {
      this.player.run(down);
      Input.runs = down;
    }
  }

  private removeEventListeners (): void {
    const target = Configs.worker ? EventsTarget : document;

    for (const [event, listener] of this.events) {
      target.removeEventListener(event, listener, false);
    }
  }

  public override dispose (): void {
    this.removeEventListeners();
    super.dispose();
  }
}
