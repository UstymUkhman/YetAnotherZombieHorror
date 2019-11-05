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

  dispatch (name) {
    document.dispatchEvent(this._events[name]);
  }

  remove (name) {
    document.removeEventListener(name, this._callbacks[name], false);
    delete this._callbacks[name];
    delete this._events[name];
  }
};

export default new Events();