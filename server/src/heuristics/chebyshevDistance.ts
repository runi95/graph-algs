import {Point} from '../algorithms/point';
import {Heuristics} from './heuristicsInterface';

export class ChebyshevDistance<P extends Point> implements Heuristics<P> {
  public static readonly label = 'Chebyshev distance';

  public calculate(a: Point, b: Point): number {
    return a.distanceMatrix(b)
      .map((d, i) => Math.abs(d) / (Math.abs(a.coords[i]) + Math.abs(b.coords[i])))
      .reduce((acc, curr) => Math.max(acc, curr), 0);
  }
};
