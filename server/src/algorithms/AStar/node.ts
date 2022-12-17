export class Node {
  public readonly x: number;
  public readonly y: number;
  public readonly isWall: boolean;

  public f: number = 0;
  public g: number = 0;
  public h: number = 0;
  public visited: boolean = false;
  public closed: boolean = false;
  public parent: this | null = null;

  constructor(x: number, y: number, isWall: boolean) {
    this.x = x;
    this.y = y;
    this.isWall = isWall;
  }

  public valueOf(): number {
    return this.h;
  }
};
