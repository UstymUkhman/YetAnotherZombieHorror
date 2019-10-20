export default class Elastic {
  constructor (value) {
    this.value = value;
    this.x = value.x;
    this.y = value.y;
    this.speed = 5;
  }

  copy (value) {
    this.x = value.x;
    this.y = value.y;
  }

  update (delta = 1 / 60) {
    const x = this.x - this.value.x;
    const y = this.y - this.value.y;

    this.value.x += x * (this.speed * delta);
    this.value.y += y * (this.speed * delta);
  }
}
