import {Node} from '../node';
import {Point} from '../point';

export class AStarNode<P extends Point> {
  public readonly node: Node<P>;

  public f = 0;
  public g = 0;
  public h = 0;
  public visited = false;
  public closed = false;
  public parent: this | null = null;

  constructor(node: Node<P>) {
    this.node = node;
  }

  public valueOf(): number {
    return this.h;
  }
}
