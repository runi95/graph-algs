import {Heuristics} from '../../heuristics/heuristicsInterface';
import {Graph} from '../graph';
import {NoValidPathError} from '../noValidPathError';
import {Point} from '../point';
import {PriorityQueue} from '../priorityQueue';
import {LPAStarNode} from './node';

export class LPAStar<P extends Point> {
  public static readonly label = 'LPA*';
  public static readonly usesHeuristics = true;

  private readonly dimensions: number[];
  private graph: LPAStarNode<P>[];

  constructor(graph: Graph<P>) {
    this.dimensions = graph.dimensions;
    this.graph = graph.nodes.map(p => new LPAStarNode(p));
  }

  private isPathable(path: number[]): boolean {
    for (let i = 0; i < path.length; i++) {
      if (path[i] < 0) return false;
      if (path[i] >= this.dimensions[i]) return false;
    }

    let mul = 1;
    const dMul = [];
    for (let i = this.dimensions.length - 1; i >= 0; i--) {
      dMul.push(mul);
      mul *= this.dimensions[i];
    }
    dMul.reverse();

    let pointRef = 0;
    for (let i = 0; i < this.dimensions.length; i++) {
      pointRef += path[i] * dMul[i];
    }

    const n = this.graph[pointRef];
    return !n.node.isWall && !n.visited;
  }

  private neighbors(node: LPAStarNode<P>): LPAStarNode<P>[] {
    const ret = [];
    const parent = node.parent;
    let mul = 1;
    const dMul = [];
    for (let i = this.dimensions.length - 1; i >= 0; i--) {
      dMul.push(mul);
      mul *= this.dimensions[i];
    }
    dMul.reverse();

    let pointRef = 0;
    for (let i = 0; i < this.dimensions.length; i++) {
      pointRef += node.node.point.coords[i] * dMul[i];
    }

    if (parent) {
      const d = [];
      for (let i = 0; i < this.dimensions.length; i++) {
        const dx = node.node.point.coords[i] - parent.node.point.coords[i];
        d.push(dx / Math.max(Math.abs(dx), 1));
      }

      for (let di = 0; di < d.length; di++) {
        if (d[di] !== 0) {
          for (let i = 0; i < this.dimensions.length; i++) {
            if (i === di) continue;
            if (node.node.point.coords[i] - 1 >= 0) {
              const n = this.graph[pointRef - dMul[i]];
              if (!n.node.isWall && !n.visited) {
                ret.push(n);
              }
            }

            if (node.node.point.coords[i] + 1 < this.dimensions[i]) {
              const n = this.graph[pointRef + dMul[i]];
              if (!n.node.isWall && !n.visited) {
                ret.push(n);
              }
            }
          }

          if (
            node.node.point.coords[di] + d[di] < this.dimensions[di] &&
            node.node.point.coords[di] + d[di] >= 0
          ) {
            const n = this.graph[pointRef + (d[di] * dMul[di])];
            if (!n.node.isWall && !n.visited) {
              ret.push(n);
            }
          }

          break;
        }
      }
    } else {
      for (let i = 0; i < this.dimensions.length; i++) {
        if (node.node.point.coords[i] + 1 < this.dimensions[i]) {
          const n = this.graph[pointRef + dMul[i]];
          if (!n.node.isWall && !n.visited) {
            ret.push(n);
          }
        }

        if (node.node.point.coords[i] - 1 >= 0) {
          const n = this.graph[pointRef - dMul[i]];
          if (!n.node.isWall && !n.visited) {
            ret.push(n);
          }
        }
      }
    }

    return ret;
  }

  private calculateKey(
    node: LPAStarNode<P>,
    destination: LPAStarNode<P>,
    heuristic: Heuristics<P>
  ) {
    const h = heuristic.calculate(node.node.point, destination.node.point);
    return [
      Math.min(node.g, node.rhs + h),
      Math.min(node.g, node.rhs),
    ];
  }

  public search(
    source: number[],
    destination: number[],
    heuristic: Heuristics<P>
  ) {
    let mul = 1;
    const dMul = [];
    for (let i = this.dimensions.length - 1; i >= 0; i--) {
      dMul.push(mul);
      mul *= this.dimensions[i];
    }
    dMul.reverse();

    let sourcePointRef = 0;
    for (let i = 0; i < this.dimensions.length; i++) {
      sourcePointRef += source[i] * dMul[i];
    }

    const startNode = this.graph[sourcePointRef];

    let destinationPointRef = 0;
    for (let i = 0; i < this.dimensions.length; i++) {
      destinationPointRef += destination[i] * dMul[i];
    }

    const destinationNode = this.graph[destinationPointRef];

    const compareKey = (a: LPAStarNode<P>, b: LPAStarNode<P>) => {
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

    const openHeap = new PriorityQueue<LPAStarNode<P>>(compareKey);

    startNode.rhs = 0;

    startNode.key = [
      heuristic.calculate(
        startNode.node.point,
        destinationNode.node.point
      ), 0];
    openHeap.add(startNode);

    const updateVertex = (u: LPAStarNode<P>) => {
      openHeap.remove(u);

      if (u.g !== u.rhs) {
        u.key = this.calculateKey(u, destinationNode, heuristic);
        openHeap.add(u);
      }
    };

    // ComputeShortestPath
    while (openHeap.size > 0) {
      const u = openHeap.poll() as LPAStarNode<P>;
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
          if (neighbor !== startNode) {
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
      let curr = destinationNode.parent as LPAStarNode<P>;
      const ret: number[][] = [];
      while (curr.parent) {
        ret.push(curr.node.point.coords);
        curr = curr.parent;
      }

      const visitedFilter = (node: LPAStarNode<P>) =>
        node.visited &&
        node !== startNode &&
        node !== destinationNode;
      const visited = this.graph
        .flat()
        .filter(visitedFilter)
        .map((n) => (n.node.point.coords));
      return {solution: ret.reverse(), visited: visited};
    }

    const visited = this.graph
      .flat()
      .filter((node: LPAStarNode<P>) => node.visited && node !== startNode)
      .map(n => n.node.point.coords);
    throw new NoValidPathError(visited);
  }
}
