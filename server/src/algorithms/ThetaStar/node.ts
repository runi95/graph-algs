import {Node} from '../node';
import {Point} from '../point';

export class ThetaStarNode<P extends Point> extends Node<P> {
  public f = 0;
  public g = Number.POSITIVE_INFINITY;
  public h = Number.POSITIVE_INFINITY;
  public visited = false;
  public closed = false;
  public parent: this | null = null;

  constructor(n: Node<P>) {
    super(n.point, n.isWall);
  }

  public valueOf(): number {
    return this.h;
  }
}
