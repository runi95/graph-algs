import {type Vector3} from 'three';
import {NodeTypes} from './NodeTypes';

export class Graph {
  public readonly matrixScale: number;
  public readonly matrixHeight: number;
  public readonly matrixScalePow: number;
  public readonly matrixSize: number;
  public readonly matrix = new Map<number, NodeTypes>();
  public readonly start: Vector3;
  public readonly goal: Vector3;

  constructor(
    matrixScale: number,
    height: number,
    start: Vector3,
    goal: Vector3
  ) {
    this.start = start;
    this.goal = goal;
    this.matrixScale = matrixScale;
    this.matrixHeight = height;
    this.matrixScalePow = matrixScale * matrixScale;
    this.matrixSize = this.matrixScalePow * this.matrixHeight;
    this.matrix.set(
      start.x +
      start.y * matrixScale +
      start.z * matrixScale * this.matrixHeight,
      NodeTypes.START
    );
    this.matrix.set(
      goal.x +
      goal.y * matrixScale +
      goal.z * matrixScale * this.matrixHeight,
      NodeTypes.GOAL
    );
  }
}
