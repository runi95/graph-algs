import {Router} from 'express';
import * as fs from 'fs-extra';
import {templatesDir} from '../config/config';
import {AStar} from '../algorithms/aStar';
import {JPS} from '../algorithms/JPS';
import {Dijkstra} from '../algorithms/Dijkstra';
import {LPAStar} from '../algorithms/LPAStar';
import {Node} from '../algorithms/node';
import {Point2D} from '../algorithms/point2d';
import {EuclideanDistance} from '../heuristics/euclideanDistance';
import {OctileDistance} from '../heuristics/octileDistance';
import {ManhattanDistance} from '../heuristics/manhattanDistance';
import {CanberraDistance} from '../heuristics/canberraDistance';
import {ChebyshevDistance} from '../heuristics/chebyshevDistance';
import {asyncHandler} from './asyncHandler';
import {NoValidPathError} from '../algorithms/noValidPathError';

export const router = Router();

const algorithms = [AStar, Dijkstra, JPS, LPAStar];
const heuristics = [
  ManhattanDistance,
  CanberraDistance,
  EuclideanDistance,
  OctileDistance,
  ChebyshevDistance,
];

router.post('/run', asyncHandler(async (req, res) => {
  const {matrix, matrixScale, start, goal, algorithm, heuristic} = req.body;

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
  fs.writeFileSync('./Divided.json', JSON.stringify({
    matrixScale,
    start,
    goal,
    matrix,
  }, null, 2));
  const alg = new Algorithm<Point2D>({
    dimensions: [matrixScale, matrixScale],
    nodes: matrix.map((node: never, i: number) => {
      const x = i % matrixScale;
      const y = Math.floor(i / matrixScale);
      return new Node(new Point2D(x, y), node === 'Wall');
    })
  });

  try {
    const data = alg.search([start.x, start.y], [goal.x, goal.y], h);
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

router.get('/options', asyncHandler(async (_req, res) => {
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
