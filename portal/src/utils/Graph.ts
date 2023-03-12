import {type Vector3} from 'three';
import {NodeTypes} from './NodeTypes';

export class Graph {
  public readonly matrixScale: number;
  public readonly matrixScalePow: number;
  public readonly matrixSize: number;
  public readonly matrix = new Map<number, NodeTypes>();
  public readonly start: Vector3;
  public readonly goal: Vector3;

  constructor(matrixScale: number, start: Vector3, goal: Vector3) {
    this.start = start;
    this.goal = goal;
    this.matrixScale = matrixScale;
    this.matrixScalePow = matrixScale * matrixScale;
    this.matrixSize = this.matrixScalePow * matrixScale;
    this.matrix.set(
      start.x +
      start.y * matrixScale +
      start.z * matrixScale * matrixScale,
      NodeTypes.START
    );
    this.matrix.set(
      goal.x +
      goal.y * matrixScale +
      goal.z * matrixScale * matrixScale,
      NodeTypes.GOAL
    );
  }
}
