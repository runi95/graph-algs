import {Heuristics} from './heuristicsInterface';

export class EuclideanDistance implements Heuristics {
  static label = 'Euclidean distance';

  public calculate(nodeX: number, nodeY: number, destinationX: number, destinationY: number): number {
    const dx = Math.abs(nodeX - destinationX);
    const dy = Math.abs(nodeY - destinationY);

    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
  }
};

