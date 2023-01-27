export abstract class Point {
  public static readonly dimensions: number;
  public readonly coords: number[];

  constructor(...coords: number[]) {
    this.coords = coords;
  }

  public distanceMatrix(p: this): number[] {
    const r = [];
    for (let i = 0; i < this.coords.length; i++) {
      r.push(this.coords[i] - p.coords[i]);
    }

    return r;
  }

  public toString(): string {
    return `(${this.coords.join(', ')})`;
  }
}
