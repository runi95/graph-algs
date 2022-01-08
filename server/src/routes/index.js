const {Router} = require('express');
const AStar = require('../algorithms/aStar');
const JPS = require('../algorithms/JPS');
const Dijkstra = require('../algorithms/Dijkstra');

// eslint-disable-next-line new-cap
const router = Router();

const algorithms = {
  astar: {
    name: 'A*',
    class: AStar,
  },
  jps: {
    name: 'Jump point',
    class: JPS,
  },
  dijkstra: {
    name: 'Dijkstra',
    class: Dijkstra,
  },
};

router.post('/run', async (req, res) => {
  const {matrix, start, goal, algorithm} = req.body;

  let alg;
  const selectedAlgorithm = algorithm.toLowerCase();
  if (algorithms.hasOwnProperty(selectedAlgorithm)) {
    // eslint-disable-next-line new-cap
    alg = new algorithms[selectedAlgorithm].class(matrix);
  } else {
    return res.status(400).send({error: `Invalid algorithm '${algorithm}'`});
  }

  const data = alg.search(start.x, start.y, goal.x, goal.y);
  return res.status(200).json(data);
});

router.get('/algorithms', async (req, res) => {
  return res.status(200).json(
      Object.keys(algorithms)
          .map((key) => ({value: key, name: algorithms[key].name})),
  );
});

module.exports = router;
