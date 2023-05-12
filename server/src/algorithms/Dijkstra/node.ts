import {Node} from '../node';
import {Point} from '../point';

export class DijkstraNode<P extends Point> extends Node<P> {
  public g = Number.MAX_VALUE;
  public visited = false;
  public closed = false;
  public parent: this | null = null;

  constructor(n: Node<P>) {
    super(n.point, n.isWall);
  }

  public valueOf(): number {
    return this.g;
  }
}
