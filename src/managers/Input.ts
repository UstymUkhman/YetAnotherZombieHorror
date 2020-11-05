import { GameEvents } from '@/managers/GameEvents';
import { Vector2 } from '@three/math/Vector2';
import { throttle } from 'lodash';

export type Directions = { [way in Direction]: number };
export const enum Direction { UP, RIGHT, DOWN, LEFT }
type Player = import('@/characters/Player').Player;
// const enum BUTTON { LEFT, WHEEL, RIGHT }

const IDLING = '0000';

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

  // private leftDown = false;
  // private aimTimeout = 0;
  // private rightTime = 0;

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

    // if (event.button === BUTTON.LEFT) {
    //   const aiming = this.player.running && this.player.aiming;
    //   this.leftDown = !this.player.running || aiming;
    // }

    // else if (event.button === BUTTON.RIGHT && !this.player.hitting) {
    //   this.rightTime = Date.now();
    //   this.rotationX.speed = 5;
    //   this.player.aim(true);
    // }
  }

  private onMouseMove (event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled) return;

    const { movementX, movementY } = event;
    this.rotation.set(movementX, movementY);
  }

  private onMousePress (event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // const empty = !this.player.weapon.magazine;
    // const recoil = this.player.shoot(this._mouseDown);
    // this._mouseDown = this._mouseDown && this.player.equipRifle && !empty;

    // this.rotationY.value += recoil.y;
    // this.rotationX.value += recoil.x;

    // this.player.character.rotation.y = this.rotationX.value;
    // this.character.rotation.x = this.rotationY.value;
    // this.camera.rotation.x = this.rotationY.value;
  }

  private onMouseUp (event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // if (this.disabled) {
    //   this.leftDown = false;
    //   return;
    // }

    // if (event.button === BUTTON.LEFT) {
    //   this.leftDown = false;
    // }

    // else if (event.button === BUTTON.RIGHT) {
    //   const y = clamp(this.rotationY.target, -0.1, 0.2);
    //   let delay = Date.now() - this.rightTime;

    //   delay = Math.max(150 - delay, 0);
    //   clearTimeout(this.aimTimeout);
    //   this.rotationY.target = y;

    //   this.aimTimeout = setTimeout(() => {
    //     this.rotationX.speed = 15;
    //     this.player.aim(false);
    //   }, delay) as unknown as number;
    // }
  }

  private onKeyDown (event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled) return;

    if (event.code === 'ShiftLeft' /* && this.moves[0] && !this.shift */) {
      // this.moves[Direction.RIGHT] = 0;
      // this.moves[Direction.DOWN] = 0;
      // this.moves[Direction.LEFT] = 0;

      // this.player.run(this.moves, true);
      this.shift = true;
      // return;
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

    const move = this.movement;

    if (this.move !== move)
      this.player.move(this.moves);

    this.move = move;
  }

  private onKeyUp (event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled) return;

    if (event.code === 'ShiftLeft' /* && this.shift */) {
      // setTimeout(() => { this.shift = false; }, 150);
      // this.player.run(this.moves, false);
      this.shift = false;
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

      case 'KeyR':
        this.player.reload();
        return;

      default:
        return;
    }

    const move = this.movement;

    if (move === IDLING)
      this.player.idle();

    else if (this.move !== move)
      this.player.move(this.moves);

    this.move = move;
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

    // this.leftDown && !this.player.hitting && !this.player.reloading && this._onMousePress();
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
