import {Point} from '../algorithms/point';
import {Heuristics} from './heuristicsInterface';

export class ManhattanDistance<P extends Point> implements Heuristics<P> {
  public static readonly label = 'Manhattan distance';

  public calculate(a: Point, b: Point): number {
    return a.distanceMatrix(b)
      .reduce((acc, curr) => acc + Math.abs(curr), 0);
  }
};
