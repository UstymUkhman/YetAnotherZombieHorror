class Input {
  constructor () {
    this._onMouseDown = this.onMouseDown.bind(this);
    this._onMouseUp = this.onMouseUp.bind(this);

    this._onKeyDown = this.onKeyDown.bind(this);
    this._onKeyUp = this.onKeyUp.bind(this);

    this.player = null;
    this._addEvents();
  }

  onMouseDown (event) {
    if (event.which === 3) {
      this.player.aim();
    }
  }

  onMouseUp (event) {
    if (event.which === 3) {
      this.player.idle();
    }
  }

  onKeyDown (event) {
  }

  onKeyUp (event) {
  }

  _addEvents () {
    document.addEventListener('mousedown', this._onMouseDown, false);
    document.addEventListener('mouseup', this._onMouseUp, false);
    document.addEventListener('keydown', this._onMouseUp, false);
    document.addEventListener('keyup', this._onMouseUp, false);
  }

  removeEvents () {
    document.removeEventListener('mousedown', this._onMouseDown, false);
    document.removeEventListener('mouseup', this._onMouseUp, false);
    document.removeEventListener('keydown', this._onMouseUp, false);
    document.removeEventListener('keyup', this._onMouseUp, false);
  }
};

export default new Input();
