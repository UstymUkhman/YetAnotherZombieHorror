class Game {
  constructor () {
    this.calls = [];
    this.loop();
  }

  add (call) {
    this.calls.push(call);
    return this.calls.length - 1;
  }

  loop () {
    for (let c = 0; c < this.calls.length; c++) {
      this.calls[c]();
    }

    requestAnimationFrame(this.loop.bind(this));
  }

  remove (call) {
    this.calls.splice(call, 1);
  }
};

export default new Game();
