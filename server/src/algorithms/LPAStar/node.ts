import {Node} from '../node';
import {Point} from '../point';

export class LPAStarNode<P extends Point> extends Node<P> {
  public key: number[];
  public g: number;
  public rhs: number;

  public visited = false;
  public closed = false;
  public parent: LPAStarNode<P> | null = null;

  constructor(n: Node<P>) {
    super(n.point, n.isWall);
    this.key = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];

    this.g = Number.POSITIVE_INFINITY;
    this.rhs = Number.POSITIVE_INFINITY;

  }

  public valueOf(): number {
    return this.g;
  }
}
