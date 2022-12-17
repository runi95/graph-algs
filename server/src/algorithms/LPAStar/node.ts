export class Node {
  public readonly x: number;
  public readonly y: number;
  public readonly isWall: boolean;

  public key: number[];
  public g: number;
  public rhs: number;

  public visited: boolean = false;
  public closed: boolean = false;
  public parent: Node | null = null;

  constructor(x: number, y: number, isWall: boolean) {
    this.x = x;
    this.y = y;
    this.isWall = isWall;
    this.key = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];

    this.g = Number.POSITIVE_INFINITY;
    this.rhs = Number.POSITIVE_INFINITY;

  }

  public valueOf(): number {
    return this.g;
  }
};
