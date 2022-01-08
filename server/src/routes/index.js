const {Router} = require('express');
const AStar = require('../algorithms/aStar');
const JPS = require('../algorithms/JPS');
const Dijkstra = require('../algorithms/Dijkstra');

// eslint-disable-next-line new-cap
const router = Router();

const algorithms = [AStar, JPS, Dijkstra];

router.post('/run', async (req, res) => {
  const {matrix, start, goal, algorithm} = req.body;

  const selectedAlgorithm = algorithm.toLowerCase();
  const Algorithm = algorithms.find(
      (algorithm) => algorithm.name.toLowerCase() === selectedAlgorithm);
  if (Algorithm === undefined) {
    return res.status(400).send({error: `Invalid algorithm '${algorithm}'`});
  }

  const data = new Algorithm(matrix).search(start.x, start.y, goal.x, goal.y);
  return res.status(200).json(data);
});

router.get('/algorithms', async (req, res) => {
  return res.status(200).json(
      algorithms.map(
          (algorithm) =>
            ({label: algorithm.label, value: algorithm.name.toLowerCase()})),
  );
});

module.exports = router;
