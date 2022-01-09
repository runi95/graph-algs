const PriorityQueue = require('../priorityQueue');
const Node = require('../AStar/node');
const OctileDistance = require('../../heuristics/octileDistance');

const octileDistance = new OctileDistance();

module.exports = class JPS {
  static label = 'Jump point';
  static usesHeuristics = true;

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
   * @param {*} x
   * @param {*} y
   * @param {*} px
   * @param {*} py
   * @param {*} destinationX
   * @param {*} destinationY
   * @return {*}
   */
  #jump(x, y, px, py, destinationX, destinationY) {
    const dx = x - px;
    const dy = y - py;

    if (x < 0 ||
        y < 0 ||
        x >= this.#graph.length ||
        y >= this.#graph[x].length
    ) {
      return null;
    }

    if (this.#graph[x][y].isWall) {
      return null;
    }

    if (x === destinationX && y === destinationY) {
      return [x, y];
    }

    if (dx !== 0) {
      if (
        (this.#isPathable(x, y - 1) &&
            !this.#isPathable(x - dx, y - 1)) ||
        (this.#isPathable(x, y + 1) &&
            !this.#isPathable(x - dx, y + 1))
      ) {
        return [x, y];
      }
    } else if (dy !== 0) {
      if (
        (this.#isPathable(x - 1, y) &&
            !this.#isPathable(x - 1, y - dy)) ||
        (this.#isPathable(x + 1, y) &&
            !this.#isPathable(x + 1, y - dy))
      ) {
        return [x, y];
      }

      if (this.#jump(x + 1, y, x, y, destinationX, destinationY) ||
          this.#jump(x - 1, y, x, y, destinationX, destinationY)
      ) {
        return [x, y];
      }
    } else {
      throw new Error('Only horizontal and vertical movements are allowed');
    }

    return this.#jump(x + dx, y + dy, x, y, destinationX, destinationY);
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
    const openHeap = new PriorityQueue();
    openHeap.add(this.#graph[sourceX][sourceY]);

    while (openHeap.size > 0) {
      const currentNode = openHeap.poll();
      currentNode.closed = true;

      if (currentNode.x === destinationX && currentNode.y === destinationY) {
        let curr = currentNode.parent;
        const path = [];
        while (curr.parent) {
          path.push({x: curr.x, y: curr.y});
          curr = curr.parent;
        }

        path.push({x: sourceX, y: sourceY});

        const visitedFilter = (node) => node.visited && node !== currentNode;
        const visited = this.#graph
            .flat()
            .filter(visitedFilter)
            .map((n) => ({x: n.x, y: n.y}));

        const solution = path
            .reduce((acc, curr, currentIndex) => {
              let prevNode;
              if (currentIndex === 0) {
                prevNode = currentNode;
              } else {
                prevNode = acc[acc.length - 1];
              }

              const arr = [];
              const dx = curr.x - prevNode.x;
              const lx = Math.abs(dx);
              for (let i = 1; i < lx + 1; i++) {
                arr.push({x: prevNode.x + i * (dx / lx), y: prevNode.y});
              }

              const dy = curr.y - prevNode.y;
              const ly = Math.abs(dy);
              for (let i = 1; i < ly + 1; i++) {
                arr.push({x: prevNode.x, y: prevNode.y + i * (dy / ly)});
              }

              return [...acc].concat(arr);
            }, [])
            .slice(0, -1)
            .reverse();
        return {solution, visited};
      }

      const neighbors = this.#neighbors(currentNode);
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        const jumpPoint = this.#jump(
            neighbor.x,
            neighbor.y,
            currentNode.x,
            currentNode.y,
            destinationX,
            destinationY,
        );

        if (jumpPoint) {
          const jx = jumpPoint[0];
          const jy = jumpPoint[1];
          const jumpNode = this.#graph[jx][jy];

          if (jumpNode.closed || jumpNode.isWall) {
            continue;
          }

          const d = octileDistance.calculate(
              neighbor.x,
              neighbor.y,
              destinationX,
              destinationY,
          );
          const gScore = currentNode.g + d;
          const beenVisited = neighbor.visited;
          if (!beenVisited || gScore < jumpNode.g) {
            jumpNode.visited = true;
            jumpNode.parent = currentNode;
            jumpNode.h = neighbor.h || heuristic.calculate(
                neighbor.x,
                neighbor.y,
                destinationX,
                destinationY,
            );
            jumpNode.g = gScore;
            jumpNode.f = jumpNode.g + jumpNode.h;

            if (!beenVisited) {
              openHeap.add(jumpNode);
            } else {
              openHeap.remove(jumpNode);
              openHeap.add(jumpNode);
            }
          }
        }
      }
    }

    throw new Error('No path to destination');
  }
};
