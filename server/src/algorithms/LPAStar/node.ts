import {Node} from '../node';
import {Point} from '../point';

export class LPAStarNode<P extends Point> {
  public readonly node: Node<P>;

  public key: number[];
  public g: number;
  public rhs: number;

  public visited = false;
  public closed = false;
  public parent: LPAStarNode<P> | null = null;

  constructor(node: Node<P>) {
    this.node = node;
    this.key = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];

    this.g = Number.POSITIVE_INFINITY;
    this.rhs = Number.POSITIVE_INFINITY;

  }

  public valueOf(): number {
    return this.g;
  }
}
