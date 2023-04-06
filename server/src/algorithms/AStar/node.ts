import {Node} from '../node';
import {Point} from '../point';

export class AStarNode<P extends Point> extends Node<P> {
  public f = 0;
  public g = 0;
  public h = 0;
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
