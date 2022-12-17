import {Heuristics} from './heuristicsInterface';

export class CanberraDistance implements Heuristics {
  public static readonly label = 'Canberra distance';

  public calculate(nodeX: number, nodeY: number, destinationX: number, destinationY: number): number {
    const dx = Math.abs(nodeX - destinationX) /
      (Math.abs(nodeX) + Math.abs(destinationX));
    const dy = Math.abs(nodeY - destinationY) /
      (Math.abs(nodeY) + Math.abs(destinationY));
    return (dx + dy);
  }
};

