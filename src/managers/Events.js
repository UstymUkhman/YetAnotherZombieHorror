class Events {
  constructor () {
    this._callbacks = { };
    this._events = { };
  }

  add (name, callback) {
    this._callbacks[name] = callback;
    this._events[name] = new CustomEvent(name);
    document.addEventListener(name, callback, false);
  }

  dispatch (name, data = null) {
    const event = this._events[name];
    event.data = data;
    document.dispatchEvent(event);
  }

  remove (name) {
    document.removeEventListener(name, this._callbacks[name], false);
    delete this._callbacks[name];
    delete this._events[name];
  }

  dispose () {
    for (const name in this._events) {
      document.removeEventListener(name, this._callbacks[name], false);
      delete this._callbacks[name];
      delete this._events[name];
    }
  }
};

export default new Events();
