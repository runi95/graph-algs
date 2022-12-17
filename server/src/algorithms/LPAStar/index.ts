import {Heuristics} from '../../heuristics/heuristicsInterface';
import {PriorityQueue} from '../priorityQueue';
import {Node} from './node';

export class LPAStar {
  static label = 'LPA*';
  static usesHeuristics = true;

  private graph: Node[][];

  constructor(graph: string[][]) {
    this.graph = graph.map((_, x) => graph[x].map((_, y) => new Node(x, y, graph[x][y] === 'Wall')));
  }

  private isPathable(x: number, y: number): boolean {
    if (x < 0) {
      return false;
    }

    if (y < 0) {
      return false;
    }

    if (x >= this.graph.length) {
      return false;
    }

    if (y >= this.graph[x].length) {
      return false;
    }

    return !this.graph[x][y].isWall && !this.graph[x][y].visited;
  }

  neighbors(node: Node): Node[] {
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
        if (this.isPathable(x, y - 1)) {
          ret.push(this.graph[x][y - 1]);
        }

        if (this.isPathable(x, y + 1)) {
          ret.push(this.graph[x][y + 1]);
        }

        if (this.isPathable(x + dx, y)) {
          ret.push(this.graph[x + dx][y]);
        }
      } else if (dy !== 0) {
        if (this.isPathable(x - 1, y)) {
          ret.push(this.graph[x - 1][y]);
        }

        if (this.isPathable(x + 1, y)) {
          ret.push(this.graph[x + 1][y]);
        }

        if (this.isPathable(x, y + dy)) {
          ret.push(this.graph[x][y + dy]);
        }
      }
    } else {
      if (this.isPathable(x + 1, y)) {
        ret.push(this.graph[x + 1][y]);
      }

      if (this.isPathable(x - 1, y)) {
        ret.push(this.graph[x - 1][y]);
      }

      if (this.isPathable(x, y + 1)) {
        ret.push(this.graph[x][y + 1]);
      }

      if (this.isPathable(x, y - 1)) {
        ret.push(this.graph[x][y - 1]);
      }
    }

    return ret;
  }

  private calculateKey(node: Node, destination: Node, heuristic: Heuristics) {
    const h = heuristic.calculate(node.x, node.y, destination.x, destination.y);
    return [
      Math.min(node.g, node.rhs + h),
      Math.min(node.g, node.rhs),
    ];
  }

  public search(sourceX: number, sourceY: number, destinationX: number, destinationY: number, heuristic: Heuristics) {
    const startNode = this.graph[sourceX][sourceY];
    const destinationNode = this.graph[destinationX][destinationY];

    const compareKey = (a: Node, b: Node) => {
      if (a.key[0] > b.key[0]) {
        return 1;
      }

      if (a.key[0] < b.key[0]) {
        return -1;
      }

      if (a.key[1] > b.key[1]) {
        return 1;
      }

      if (a.key[1] < b.key[1]) {
        return -1;
      }

      return 0;
    };

    const openHeap = new PriorityQueue<Node>(compareKey);

    startNode.rhs = 0;

    startNode.key = [
      heuristic.calculate(
        startNode.x,
        startNode.y,
        destinationNode.x,
        destinationNode.y,
      ), 0];
    openHeap.add(this.graph[sourceX][sourceY]);

    const updateVertex = (u: Node) => {
      openHeap.remove(u);

      if (u.g !== u.rhs) {
        u.key = this.calculateKey(u, destinationNode, heuristic);
        openHeap.add(u);
      }
    };

    // ComputeShortestPath
    while (openHeap.size > 0) {
      const u = openHeap.poll() as Node;
      u.visited = true;

      destinationNode.key = this.calculateKey(
        destinationNode,
        destinationNode,
        heuristic,
      );
      if (compareKey(u, destinationNode) >= 0 &&
        destinationNode.rhs === destinationNode.g
      ) {
        break;
      }

      if (u.g > u.rhs) {
        u.g = u.rhs;
        this.neighbors(u).forEach((neighbor) => {
          if (neighbor.rhs > u.g + 1) {
            neighbor.parent = u;
            neighbor.rhs = u.g + 1;
          }

          updateVertex(neighbor);
        });
      } else {
        u.g = Number.POSITIVE_INFINITY;

        this.neighbors(u).forEach((neighbor) => {
          if (neighbor.x !== startNode.x || neighbor.y !== startNode.y) {
            let nrhs = Number.POSITIVE_INFINITY;
            let nparent = null;
            this.neighbors(neighbor).forEach(
              (minNeighbor) => {
                const ng = minNeighbor.g + 1;
                if (ng < nrhs) {
                  nparent = minNeighbor;
                  nrhs = ng;
                }
              });
            neighbor.rhs = nrhs;
            neighbor.parent = nparent;
          }

          updateVertex(neighbor);
        });
        updateVertex(u);
      }
    }

    if (destinationNode.g < Number.POSITIVE_INFINITY) {
      let curr = destinationNode.parent as Node;
      const ret = [];
      while (curr.parent) {
        ret.push({x: curr.x, y: curr.y});
        curr = curr.parent;
      }

      const visitedFilter = (node: Node) =>
        node.visited &&
        node !== startNode &&
        node !== destinationNode;
      const visited = this.graph
        .flat()
        .filter(visitedFilter)
        .map((n) => ({x: n.x, y: n.y}));
      return {solution: ret.reverse(), visited: visited};
    }

    throw new Error('No path to destination');
  }
};
