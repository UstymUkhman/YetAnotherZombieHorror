import { Vector2 } from '@three/math/Vector2';

export default class Elastic {
  private target = new Vector2();
  private speed = 3;

  public constructor (public value = new Vector2()) {
    this.target.copy(value);
  }

  public copy (target: Vector2): void {
    this.target.copy(target);
  }

  public update (delta: number): void {
    const x = this.target.x - this.value.x;
    const y = this.target.y - this.value.y;

    this.value.x += x * (this.speed * delta);
    this.value.y += y * (this.speed * delta);
  }
}
