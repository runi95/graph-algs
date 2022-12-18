import {Point} from './point';

export class Point2D extends Point {
  public static override readonly dimensions: number = 2;

  constructor(x: number, y: number) {
    super(x, y);
  }

  public get x(): number {
    return this.coords[0];
  }

  public get y(): number {
    return this.coords[1];
  }

  public override distanceMatrix(p: this): number[] {
    return [this.x - p.x, this.y - p.y];
  }
};
