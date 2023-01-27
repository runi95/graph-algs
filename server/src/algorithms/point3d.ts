import {Point} from './point';

export class Point3D extends Point {
  public static override readonly dimensions: number = 3;

  constructor(x: number, y: number, z: number) {
    super(x, y, z);
  }

  public get x(): number {
    return this.coords[0];
  }

  public get y(): number {
    return this.coords[1];
  }

  public get z(): number {
    return this.coords[2];
  }

  public override distanceMatrix(p: this): number[] {
    return [this.x - p.x, this.y - p.y, this.z - p.z];
  }
}
