import {Heuristics} from './heuristicsInterface';

export class OctileDistance implements Heuristics {
  public static readonly label = 'Octile distance';

  calculate(nodeX: number, nodeY: number, destinationX: number, destinationY: number): number {
    const dx = Math.abs(nodeX - destinationX);
    const dy = Math.abs(nodeY - destinationY);
    const f = Math.SQRT2 - 1;

    return (dx < dy) ? f * dx + dy : f * dy + dx;
  }
};

