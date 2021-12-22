// const BinaryHeap = require('./binaryHeap');
const PriorityQueue = require('../priorityQueue');
const Node = require('./node');

// Hardcoded for simplicity
const D = 1;

module.exports = class AStar {
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
   * @param {Number} nodeX
   * @param {Number} nodeY
   * @param {Number} destinationX
   * @param {Number} destinationY
   * @return {Number} The euclidean distance between node and destination
   */
  #euclideanDistance(nodeX, nodeY, destinationX, destinationY) {
    const dx = Math.abs(nodeX - destinationX);
    const dy = Math.abs(nodeY - destinationY);

    return D * Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
  }

  /**
   * TODO: Write JSDoc
   *
   * @param {Number} nodeX
   * @param {Number} nodeY
   * @param {Number} destinationX
   * @param {Number} destinationY
   * @return {Number} The manhattan distance between node and destination
   */
  #manhattanDistance(nodeX, nodeY, destinationX, destinationY) {
    const dx = Math.abs(nodeX - destinationX);
    const dy = Math.abs(nodeY - destinationY);
    return D * (dx + dy);
  }

  /**
   * TODO: Write JSDoc
   *
   * @param {Node} node
   * @return {Node}
   */
  #neighbors(node) {
    const ret = [];
    const x = node.x;
    const y = node.y;

    if (this.#graph[x + 1] && this.#graph[x + 1][y]) {
      ret.push(this.#graph[x + 1][y]);
    }

    if (this.#graph[x - 1] && this.#graph[x - 1][y]) {
      ret.push(this.#graph[x - 1][y]);
    }

    if (this.#graph[x] && this.#graph[x][y + 1]) {
      ret.push(this.#graph[x][y + 1]);
    }

    if (this.#graph[x] && this.#graph[x][y - 1]) {
      ret.push(this.#graph[x][y - 1]);
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
   * @param {*} heuristic
   * @return {*}
   */
  search(sourceX, sourceY, destinationX, destinationY, heuristic) {
    heuristic = heuristic || this.#euclideanDistance;

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
          neighbor.h = neighbor.h || heuristic(
              neighbor.x,
              neighbor.y,
              destinationX,
              destinationY,
          );
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
