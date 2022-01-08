const PriorityQueue = require('../priorityQueue');
const Node = require('../AStar/node');

module.exports = class Dijkstra {
  static label = 'Dijkstra';

  #graph;
  /**
   * TODO: Write JSDoc
   *
   * @param {*} graph
   */
  constructor(graph) {
    this.#graph = graph.map((_, x) => graph[x].map((_, y) => new Node(x, y, graph[x][y] === 'Wall')));
  }

  /**
   * TODO: Write JSDoc
   *
   * @param {*} x
   * @param {*} y
   * @return {Boolean}
   */
  #isPathable(x, y) {
    if (x < 0) {
      return false;
    }

    if (y < 0) {
      return false;
    }

    if (x >= this.#graph.length) {
      return false;
    }

    if (y >= this.#graph[x].length) {
      return false;
    }

    return !this.#graph[x][y].isWall;
  }

  /**
   * TODO: Write JSDoc
   *
   * @param {Node} node
   * @return {Node}
   */
  #neighbors(node) {
    const ret = [];
    const parent = node.parent;
    const x = node.x;
    const y = node.y;

    if (parent) {
      const px = parent.x;
      const py = parent.y;

      const dx = (x - px) / Math.max(Math.abs(x - px), 1);
      const dy = (y - py) / Math.max(Math.abs(y - py), 1);

      if (dx !== 0) {
        if (this.#isPathable(x, y - 1)) {
          ret.push(this.#graph[x][y - 1]);
        }

        if (this.#isPathable(x, y + 1)) {
          ret.push(this.#graph[x][y + 1]);
        }

        if (this.#isPathable(x + dx, y)) {
          ret.push(this.#graph[x + dx][y]);
        }
      } else if (dy !== 0) {
        if (this.#isPathable(x - 1, y)) {
          ret.push(this.#graph[x - 1][y]);
        }

        if (this.#isPathable(x + 1, y)) {
          ret.push(this.#graph[x + 1][y]);
        }

        if (this.#isPathable(x, y + dy)) {
          ret.push(this.#graph[x][y + dy]);
        }
      }
    } else {
      if (this.#isPathable(x + 1, y)) {
        ret.push(this.#graph[x + 1][y]);
      }

      if (this.#isPathable(x - 1, y)) {
        ret.push(this.#graph[x - 1][y]);
      }

      if (this.#isPathable(x, y + 1)) {
        ret.push(this.#graph[x][y + 1]);
      }

      if (this.#isPathable(x, y - 1)) {
        ret.push(this.#graph[x][y - 1]);
      }
    }

    return ret;
  }

  /**
   * TODO: Write JSDoc
   *
   * @param {*} sourceX
   * @param {*} sourceY
   * @param {*} destinationX
   * @param {*} destinationY
   * @return {*}
   */
  search(sourceX, sourceY, destinationX, destinationY) {
    const openHeap = new PriorityQueue();
    openHeap.add(this.#graph[sourceX][sourceY]);

    while (openHeap.size > 0) {
      const currentNode = openHeap.poll();

      if (currentNode.x === destinationX && currentNode.y === destinationY) {
        let curr = currentNode.parent;
        const ret = [];
        while (curr.parent) {
          ret.push({x: curr.x, y: curr.y});
          curr = curr.parent;
        }

        const visitedFilter = (node) => node.visited && node !== currentNode;
        const visited = this.#graph
            .flat()
            .filter(visitedFilter)
            .map((n) => ({x: n.x, y: n.y}));
        return {solution: ret.reverse(), visited: visited};
      }

      currentNode.closed = true;

      const neighbors = this.#neighbors(currentNode);
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];

        if (neighbor.closed || neighbor.isWall) {
          continue;
        }

        const gScore = currentNode.g + 1;
        const beenVisited = neighbor.visited;
        if (!beenVisited || gScore < neighbor.g) {
          neighbor.visited = true;
          neighbor.parent = currentNode;
          neighbor.h = neighbor.h || 0;
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;

          if (!beenVisited) {
            openHeap.add(neighbor);
          } else {
            openHeap.remove(neighbor);
            openHeap.add(neighbor);
          }
        }
      }
    }

    throw new Error('No path to destination');
  }
};
