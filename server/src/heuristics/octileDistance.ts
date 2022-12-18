import {Point} from '../algorithms/point';
import {Heuristics} from './heuristicsInterface';

export class OctileDistance<P extends Point> implements Heuristics<P> {
  public static readonly label = 'Octile distance';
  private readonly f: number;

  constructor(f: number = Math.SQRT2 - 1) {
    this.f = f;
  }

  calculate(a: Point, b: Point): number {
    let dMax = 0;
    let dMaxIndex = 0;
    return a.distanceMatrix(b)
      .map((d, i) => {
        const dAbs = Math.abs(d);
        if (dAbs > dMax) {
          dMax = dAbs;
          dMaxIndex = i;
        };

        return dAbs;
      })
      .reduce((acc, curr, i) => {
        if (i === dMaxIndex) {
          return acc + curr;
        }

        return acc + (this.f * curr);
      }, 0);
  }
};
