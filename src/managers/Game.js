import { Clock } from '@three/core/Clock';

class Game {
  constructor () {
    this._clock = new Clock();
    this.calls = [];
    this.loop();
  }

  add (call) {
    this.calls.push(call);
    return this.calls.length - 1;
  }

  loop () {
    const delta = this._clock.getDelta();

    for (let c = 0; c < this.calls.length; c++) {
      this.calls[c](delta);
    }

    requestAnimationFrame(this.loop.bind(this));
  }

  remove (call) {
    this.calls.splice(call, 1);
  }
};

export default new Game();
