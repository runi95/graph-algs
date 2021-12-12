const {Router} = require('express');
const AStar = require('../algorithms/aStar');

// eslint-disable-next-line new-cap
const router = Router();

router.post('/run', async (req, res) => {
  const {matrix, start, goal} = req.body;

  const aStar = new AStar(matrix);
  const data = aStar.search(start.x, start.y, goal.x, goal.y);

  return res.status(200).json(data);
});

module.exports = router;
