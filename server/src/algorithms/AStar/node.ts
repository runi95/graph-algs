import {Node} from '../node';
import {Point} from '../point';

export class AStarNode<P extends Point> {
  public readonly node: Node<P>;

  public f: number = 0;
  public g: number = 0;
  public h: number = 0;
  public visited: boolean = false;
  public closed: boolean = false;
  public parent: this | null = null;

  constructor(node: Node<P>) {
    this.node = node;
  }

  public valueOf(): number {
    return this.h;
  }
};
