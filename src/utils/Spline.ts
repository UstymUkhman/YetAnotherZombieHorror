type Lerp = (v0: number, v1: number, t: number) => number;
import { lerp as nLerp } from '@/utils/Number';

export default class Spline
{
  private pointsLength = 0;
  private readonly points: Array<[number, number]> = [];
  public constructor (private readonly lerp: Lerp = nLerp) {}

  public addPoint (time: number, value: number): void {
    this.pointsLength = this.points.length + 1;
    this.points.push([time, value]);
  }

  public getValue (delta: number): number {
    let p1 = 0;

    for (let p = 0; p < this.pointsLength; p++) {
      if (this.points[p][0] >= delta) break;
      p1 = p;
    }

    const p2 = Math.min(this.pointsLength - 1, p1 + 1);

    return p1 === p2 ? this.points[p1][1] : this.lerp(
      this.points[p1][1], this.points[p2][1],

      (delta - this.points[p1][0]) / (
        this.points[p2][0] - this.points[p1][0]
      )
    );
  }

  public dispose (): void {
    this.pointsLength = 0;
    this.points.splice(0);
  }
}
