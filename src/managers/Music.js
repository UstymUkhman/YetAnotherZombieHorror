class Music {
  constructor () {
    this.tracks = [
      new Audio('assets/music/zeig-dich.mp3'),
      new Audio('assets/music/day-of-the-dead.mp3'),
      new Audio('assets/music/haunted.mp3')
    ];

    this._volume = 1;
    this._index = 0;
    this.load();
  }

  load () {
    for (const track of this.tracks) {
      track.onended = this.onEnd.bind(this);
      track.autoplay = false;
      track.muted = false;
      track.loop = false;
      track.volume = 0.1;
      track.load();
    }
  }

  toggle (play) {
    const track = this.tracks[this._index];
    play ? track.play() : track.pause();
  }

  set (index) {
    if (this._index === index) return;

    this.tracks[this._index].pause();
    this.tracks[this._index].currentTime = 0;

    this.tracks[index].play();
    this._index = index;
  }

  mute (mute) {
    for (let track of this.tracks) {
      track.muted = mute;
    }
  }

  onEnd () {
    const next = this._index + 1;
    const tracks = this.tracks.length;

    this.tracks[this._index].pause();
    this.tracks[this._index].currentTime = 0;

    this._index = next === tracks ? 0 : next;
    this.toggle(true);
  }

  set volume (value) {
    for (let track of this.tracks) {
      track.volume = value;
    }

    this._volume = value;
  }

  get volume () {
    return this._volume;
  }
};

export default new Music();
