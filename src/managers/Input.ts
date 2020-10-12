import { GameEvents } from '@/managers/GameEvents';
import { Elastic /*, clamp */ } from '@/utils/number';
import { throttle } from 'lodash';

class Input {
  private readonly mousePress = throttle(this.onMousePress.bind(this), 150, { leading: true });
  private readonly pointerLockChange = this.onPointerLockChange.bind(this);
  private readonly pointerLockError = this.onPointerLockError.bind(this);

  private readonly contextMenu = this.onContextMenu.bind(this);
  private readonly mouseDown = this.onMouseDown.bind(this);
  private readonly mouseMove = this.onMouseMove.bind(this);
  private readonly mouseUp = this.onMouseUp.bind(this);

  private readonly keyDown = this.onKeyDown.bind(this);
  private readonly keyUp = this.onKeyUp.bind(this);

  private rotationX = new Elastic(0);
  private rotationY = new Elastic(0);

  private paused = true;

  constructor () {
    this.addEvents();
    this.init();
  }

  private init (): void {
    this.rotationX = new Elastic(0);
    this.rotationY = new Elastic(0);
    this.rotationX.speed = 15;
  }

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

  private requestPointerLock (): void {
    document.documentElement.requestPointerLock();
  }

  private exitPointerLock (): void {
    document.exitPointerLock();
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

  private onContextMenu (event: Event): void | boolean {
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

  private get pointerLocked (): boolean {
    return !!document.pointerLockElement;
  }
}

export default new Input();
