import {Router, Request, Response} from 'express';
import * as fs from 'fs-extra';
import {templatesDir} from '../config/config';
import {AStar} from '../algorithms/aStar';
import {Dijkstra} from '../algorithms/Dijkstra';
import {LPAStar} from '../algorithms/LPAStar';
import {Node} from '../algorithms/node';
import {EuclideanDistance} from '../heuristics/euclideanDistance';
import {OctileDistance} from '../heuristics/octileDistance';
import {ManhattanDistance} from '../heuristics/manhattanDistance';
import {CanberraDistance} from '../heuristics/canberraDistance';
import {ChebyshevDistance} from '../heuristics/chebyshevDistance';
import {asyncHandler} from './asyncHandler';
import {NoValidPathError} from '../algorithms/noValidPathError';
import {Point3D} from '../algorithms/point3d';
import {DepthFirstSearch} from '../algorithms/DFS';
import {BreathFirstSearch} from '../algorithms/BFS';
import {DStarLite} from '../algorithms/DStarLite';
import {ThetaStar} from '../algorithms/ThetaStar';
import {LazyThetaStar} from '../algorithms/LazyThetaStar';

export const router = Router();

const algorithms = [
  DepthFirstSearch,
  BreathFirstSearch,
  Dijkstra,
  AStar,
  DStarLite,
  // JPS,
  LPAStar,
  ThetaStar,
  LazyThetaStar
];
const heuristics = [
  ManhattanDistance,
  CanberraDistance,
  EuclideanDistance,
  OctileDistance,
  ChebyshevDistance,
];

interface Vector3D {
  x: number;
  y: number;
  z: number;
}

enum NodeTypes {
  EMPTY = 0,
  WALL = 1,
  VISITED = 2,
  SOLUTION = 3,
  START = 4,
  GOAL = 5
}

interface RunModel {
  matrix: Record<number, NodeTypes>;
  matrixScale: number;
  matrixHeight: number;
  matrixScalePow: number;
  matrixSize: number;
  start: Vector3D;
  goal: Vector3D,
  algorithm: string;
  heuristic: string;
}

interface CustomRequest<T> extends Request {
  body: T;
}

router.post('/run', asyncHandler(async (req: CustomRequest<RunModel>, res: Response) => {
  const {
    matrix,
    matrixScale,
    matrixHeight,
    matrixScalePow,
    matrixSize,
    start,
    goal,
    algorithm,
    heuristic
  } = req.body;
  const selectedAlgorithm = algorithm.toLowerCase();
  const selectedHeuristic = heuristic.toLowerCase();

  const Heuristic = heuristics.find(
    (heuristic) => heuristic.name.toLowerCase() === selectedHeuristic);
  if (Heuristic === undefined) {
    return res.status(400).send({error: `Invalid heuristic '${heuristic}'`});
  }

  const Algorithm = algorithms.find(
    (algorithm) => algorithm.name.toLowerCase() === selectedAlgorithm);
  if (Algorithm === undefined) {
    return res.status(400).send({error: `Invalid algorithm '${algorithm}'`});
  }

  const h = new Heuristic();
  const startTime = process.hrtime();
  const nodes: Node<Point3D>[] = [];
  for (let i = 0; i < matrixSize; i++) {
    const node = matrix[i] ?? NodeTypes.EMPTY;
    const x = i % matrixScale;
    const y = Math.floor(i / matrixScale) % matrixScale;
    const z = Math.floor(i / matrixScalePow);
    nodes.push(new Node(new Point3D(x, y, z), node === NodeTypes.WALL));
  }
  const alg = new Algorithm<Point3D>({
    dimensions: [matrixScale, matrixScale, matrixHeight],
    nodes
  });

  try {
    const data = alg.search(
      new Point3D(start.x, start.y, start.z),
      new Point3D(goal.x, goal.y, goal.z),
      h
    );
    const executionTime = process.hrtime(startTime)[1] / 1000000;

    return res.status(200).json({...data, executionTime});
  } catch (err) {
    if (err instanceof NoValidPathError) {
      return res.status(200).json({
        solution: [],
        visited: err.visited,
        executionTime: 0
      });
    } else {
      throw err;
    }
  }
}));

router.get('/options', asyncHandler(async (_req: Request, res: Response) => {
  const mappedAlgorithms = algorithms.map(
    (algorithm) =>
    ({
      label: algorithm.label,
      value: algorithm.name.toLowerCase(),
      usesHeuristics: algorithm.usesHeuristics,
    }));

  const mappedHeuristics = heuristics.map(
    (heuristic) =>
      ({label: heuristic.label, value: heuristic.name.toLowerCase()}));

  const files = await fs.readdir(templatesDir);
  const templates = files.map((file) => file.replace(new RegExp('\.[^/.]+$'), ''));

  return res.status(200).json({
    algorithms: mappedAlgorithms,
    algorithm: mappedAlgorithms[0],
    heuristics: mappedHeuristics,
    heuristic: mappedHeuristics[0],
    templates: templates,
  });
}));
