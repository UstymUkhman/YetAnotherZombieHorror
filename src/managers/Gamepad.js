class Gamepad {
  constructor () {
    this.gamepad = null;
    this.search();
  }

  onFound (event) {
    this.gamepad = event.detail.controller;
    console.info(`Gamepad found at index ${this.gamepad.index}.`);
    console.info(`${this.gamepad.name} is ready!`);
  }

  onLost (event) {
    console.info(`The controller at index ${event.detail.index} has been disconnected.`);
    console.info(`Currently connected gamepads: ${window.Controller.controllerCount}`);

    this.gamepad = window.Controller.getController(0) || null;

    if (this.gamepad) {
      console.info(`Now using ${this.gamepad.name} found at index ${this.gamepad.index}.`);
    }
  }

  search () {
    if (window.Controller.supported) {
      window.addEventListener('gc.controller.found', this.onFound, false);
      window.addEventListener('gc.controller.lost', this.onLost, false);

      window.Controller.search();
    }
  }

  get gamepad () {
    return this.gamepad;
  }
};

export default new Gamepad();
