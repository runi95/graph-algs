const {Router} = require('express');
const fs = require('fs-extra');
const {templatesDir} = require('../config/config');
const AStar = require('../algorithms/aStar');
const JPS = require('../algorithms/JPS');
const Dijkstra = require('../algorithms/Dijkstra');
const LPAStar = require('../algorithms/LPAStar');
const OctileDistance = require('../heuristics/octileDistance');
const EuclideanDistance = require('../heuristics/euclideanDistance');
const ManhattanDistance = require('../heuristics/manhattanDistance');
const CanberraDistance = require('../heuristics/canberraDistance');
const ChebyshevDistance = require('../heuristics/chebyshevDistance');

// eslint-disable-next-line new-cap
const router = Router();

const algorithms = [AStar, JPS, Dijkstra, LPAStar];
const heuristics = [
  ManhattanDistance,
  CanberraDistance,
  EuclideanDistance,
  OctileDistance,
  ChebyshevDistance,
];

router.post('/run', async (req, res) => {
  const {matrix, start, goal, algorithm, heuristic} = req.body;

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
  const alg = new Algorithm(matrix);
  const data = alg.search(start.x, start.y, goal.x, goal.y, h);
  const executionTime = process.hrtime(startTime)[1] / 1000000;

  return res.status(200).json({...data, executionTime});
});

router.get('/options', async (_req, res) => {
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
});

module.exports = router;
