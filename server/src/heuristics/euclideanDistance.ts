import {Point} from '../algorithms/point';
import {Heuristics} from './heuristicsInterface';

export class EuclideanDistance<P extends Point> implements Heuristics<P> {
  public static readonly label = 'Euclidean distance';

  public calculate(a: P, b: P): number {
    return Math.sqrt(a.distanceMatrix(b).reduce((acc, curr) => acc + Math.pow(curr, 2), 0));
  }
};

