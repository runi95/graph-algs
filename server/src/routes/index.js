const {Router} = require('express');
const AStar = require('../algorithms/aStar');
const JPS = require('../algorithms/JPS');
const Dijkstra = require('../algorithms/Dijkstra');

// eslint-disable-next-line new-cap
const router = Router();

router.post('/run', async (req, res) => {
  const {matrix, start, goal, algorithm} = req.body;

  let alg;
  switch (algorithm.toLowerCase()) {
    case 'astar':
      alg = new AStar(matrix);
      break;
    case 'jps':
      alg = new JPS(matrix);
      break;
    case 'dijkstra':
      alg = new Dijkstra(matrix);
      break;
    default:
      return res.status(400).send({error: `Invalid algorithm '${algorithm}'`});
  }

  const data = alg.search(start.x, start.y, goal.x, goal.y);
  return res.status(200).json(data);
});

module.exports = router;
