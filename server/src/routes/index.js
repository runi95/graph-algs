const {Router} = require('express');
const AStar = require('../algorithms/aStar');
const JPS = require('../algorithms/JPS');
const Dijkstra = require('../algorithms/Dijkstra');
const OctileDistance = require('../heuristics/octileDistance');
const EuclideanDistance = require('../heuristics/euclideanDistance');
const ManhattanDistance = require('../heuristics/manhattanDistance');
const CanberraDistance = require('../heuristics/canberraDistance');
const ChebyshevDistance = require('../heuristics/chebyshevDistance');

// eslint-disable-next-line new-cap
const router = Router();

const algorithms = [AStar, JPS, Dijkstra];
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

  const data = new Algorithm(matrix)
      .search(start.x, start.y, goal.x, goal.y, new Heuristic());

  return res.status(200).json(data);
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

  return res.status(200).json({
    algorithms: mappedAlgorithms,
    algorithm: mappedAlgorithms[0],
    heuristics: mappedHeuristics,
    heuristic: mappedHeuristics[0],
  });
});

module.exports = router;
