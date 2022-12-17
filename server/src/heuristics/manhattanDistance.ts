import {Heuristics} from './heuristicsInterface';

export class ManhattanDistance implements Heuristics {
  public static readonly label = 'Manhattan distance';

  public calculate(nodeX: number, nodeY: number, destinationX: number, destinationY: number): number {
    const dx = Math.abs(nodeX - destinationX);
    const dy = Math.abs(nodeY - destinationY);
    return (dx + dy);
  }
};
