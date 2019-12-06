import Input from '@/managers/Input';

const BUTTONS = new Map();

BUTTONS.set(8, 'SELECT');
BUTTONS.set(9, 'START');

BUTTONS.set(4, 'RUN');
BUTTONS.set(5, 'CHANGE');

BUTTONS.set(6, 'AIM');
BUTTONS.set(7, 'SHOOT');

class Gamepad {
  constructor () {
    this._index = -1;
    this._aiming = false;
    this._gamepad = null;
    this._shooting = false;
    this._moves = [0, 0, 0, 0];

    this._onLost = this.onLost.bind(this);
    this._onFound = this.onFound.bind(this);

    window.addEventListener('gamepadconnected', this._onFound);
    window.addEventListener('gamepaddisconnected ', this._onLost);
  }

  createCustomEvents () {
    this.rotation = new CustomEvent('rotation');
    this.shoot = new CustomEvent('shoot');
    this.move = new CustomEvent('move');
    this.aim = new CustomEvent('aim');

    this.rotation.movementX = 0;
    this.rotation.movementY = 0;

    this.move.keyCode = -1;
    this.shoot.which = 1;
    this.aim.which = 3;
  }

  vibrate (duration) {
    if (this.props.gamepad.vibrationActuator) {
      this.props.gamepad.vibrationActuator.playEffect('dual-rumble', {
        strongMagnitude: 1.0,
        weakMagnitude: 1.0,
        duration: duration,
        startDelat: 0
      });
    }
  }

  update () {
    this._gamepad = navigator.getGamepads()[this._index];
    const buttons = this._gamepad.buttons;
    const axes = this._gamepad.axes;

    this.updateRotationValues(axes[2] * 3, axes[3] * 3);
    this.updatePositionValues(axes[0], axes[1]);

    for (let b = 0; b < buttons.length; b++) {
      const pressed = buttons[b].pressed;
      const command = BUTTONS.get(b);
      const value = buttons[b].value;

      switch (command) {
        case 'START':
          if (pressed && Input.paused) {
            Input.requestPointerLock();
          }

          break;

        case 'SELECT':
          if (pressed && !Input.paused) {
            Input.exitPointerLock();
          }

          break;

        case 'AIM':
          if (value > 0.75 && !this._aiming) {
            Input.onMouseDown(this.aim);
            this._aiming = true;
          } else if (value < 0.75 && this._aiming) {
            Input.onMouseUp(this.aim);
            this._aiming = false;
          }

          break;

        case 'SHOOT':
          if (value > 0.75 && !this._shooting) {
            Input.onMouseDown(this.shoot);
            this._shooting = true;
          } else if (value < 0.75 && this._shooting) {
            Input.onMouseUp(this.shoot);
            this._shooting = false;
          }

          break;
      }
    }

    requestAnimationFrame(this.update.bind(this));
  }

  updatePositionValues (x, y) {
    const left = x < -0.5;
    const right = x > 0.5;
    const forward = y < -0.5;
    const backward = y > 0.5;

    if (forward && !this._moves[0]) {
      this._moves[0] = 1;
      this.move.keyCode = 87;
      Input.onKeyDown(this.move);
    } else if (!forward && this._moves[0]) {
      this._moves[0] = 0;
      this.move.keyCode = 87;
      Input.onKeyUp(this.move);
    }

    if (left && !this._moves[1]) {
      this._moves[1] = 1;
      this.move.keyCode = 65;
      Input.onKeyDown(this.move);
    } else if (!left && this._moves[1]) {
      this._moves[1] = 0;
      this.move.keyCode = 65;
      Input.onKeyUp(this.move);
    }

    if (backward && !this._moves[2]) {
      this._moves[2] = 1;
      this.move.keyCode = 83;
      Input.onKeyDown(this.move);
    } else if (!backward && this._moves[2]) {
      this._moves[2] = 0;
      this.move.keyCode = 83;
      Input.onKeyUp(this.move);
    }

    if (right && !this._moves[3]) {
      this._moves[3] = 1;
      this.move.keyCode = 68;
      Input.onKeyDown(this.move);
    } else if (!right && this._moves[3]) {
      this._moves[3] = 0;
      this.move.keyCode = 68;
      Input.onKeyUp(this.move);
    }
  }

  updateRotationValues (x, y) {
    if (Math.abs(x) > 1) {
      this.rotation.movementX += x;
    } else {
      this.rotation.movementX = 0;
    }

    if (Math.abs(y) > 1) {
      this.rotation.movementY += y;
    } else {
      this.rotation.movementY = 0;
    }

    Input.onMouseMove(this.rotation);
  }

  onFound (event) {
    console.log(event);
    this.createCustomEvents();
    this._index = event.gamepad.index;
    console.info(`${event.gamepad.id} is ready!`);
    requestAnimationFrame(this.update.bind(this));
  }

  onLost (event) {
    console.log(event);
    this._gamepad = null;
    console.info('Gamepad was disconected.');
  }
};

export default new Gamepad();
