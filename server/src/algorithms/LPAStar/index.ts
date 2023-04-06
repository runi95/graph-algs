import {Heuristics} from '../../heuristics/heuristicsInterface';
import {ClientMatrix, Graph} from '../graph';
import {NoValidPathError} from '../noValidPathError';
import {Point} from '../point';
import {PriorityQueue} from '../priorityQueue';
import {LPAStarNode} from './node';

export class LPAStar<P extends Point> {
  public static readonly label = 'LPA*';
  public static readonly usesHeuristics = true;
  private readonly graph: Graph<P, LPAStarNode<P>>;

  constructor(clientMatrix: ClientMatrix<P>) {
    this.graph = new Graph(
      clientMatrix.dimensions,
      clientMatrix.nodes.map(n => new LPAStarNode(n))
    );
  }

  private neighbors(node: LPAStarNode<P>): LPAStarNode<P>[] {
    const ret = [];
    const parent = node.parent;

    let pointRef = 0;
    for (let i = 0; i < this.graph.dimensions.length; i++) {
      pointRef += node.point.coords[i] * this.graph.dMul[i];
    }

    if (parent) {
      const d = [];
      for (let i = 0; i < this.graph.dimensions.length; i++) {
        const dx = node.point.coords[i] - parent.point.coords[i];
        d.push(dx / Math.max(Math.abs(dx), 1));
      }

      for (let di = 0; di < d.length; di++) {
        if (d[di] !== 0) {
          for (let i = 0; i < this.graph.dimensions.length; i++) {
            if (i === di) continue;
            if (node.point.coords[i] - 1 >= 0) {
              const n = this.graph.nodes[pointRef - this.graph.dMul[i]];
              if (!n.isWall && !n.visited) {
                ret.push(n);
              }
            }

            if (node.point.coords[i] + 1 < this.graph.dimensions[i]) {
              const n = this.graph.nodes[pointRef + this.graph.dMul[i]];
              if (!n.isWall && !n.visited) {
                ret.push(n);
              }
            }
          }

          if (
            node.point.coords[di] + d[di] < this.graph.dimensions[di] &&
            node.point.coords[di] + d[di] >= 0
          ) {
            const n =
              this.graph.nodes[pointRef + (d[di] * this.graph.dMul[di])];
            if (!n.isWall && !n.visited) {
              ret.push(n);
            }
          }

          break;
        }
      }
    } else {
      for (let i = 0; i < this.graph.dimensions.length; i++) {
        if (node.point.coords[i] + 1 < this.graph.dimensions[i]) {
          const n = this.graph.nodes[pointRef + this.graph.dMul[i]];
          if (!n.isWall && !n.visited) {
            ret.push(n);
          }
        }

        if (node.point.coords[i] - 1 >= 0) {
          const n = this.graph.nodes[pointRef - this.graph.dMul[i]];
          if (!n.isWall && !n.visited) {
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
    const h = heuristic.calculate(node.point, destination.point);
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
    let sourcePointRef = 0;
    for (let i = 0; i < this.graph.dimensions.length; i++) {
      sourcePointRef += source[i] * this.graph.dMul[i];
    }

    const startNode = this.graph.nodes[sourcePointRef];

    let destinationPointRef = 0;
    for (let i = 0; i < this.graph.dimensions.length; i++) {
      destinationPointRef += destination[i] * this.graph.dMul[i];
    }

    const destinationNode = this.graph.nodes[destinationPointRef];

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
        startNode.point,
        destinationNode.point
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
        ret.push(curr.point.coords);
        curr = curr.parent;
      }

      const visitedFilter = (node: LPAStarNode<P>) =>
        node.visited &&
        node !== startNode &&
        node !== destinationNode;
      const visited = this.graph.nodes
        .filter(visitedFilter)
        .map((n) => (n.point.coords));
      return {solution: ret.reverse(), visited: visited};
    }

    const visited = this.graph.nodes
      .filter((node: LPAStarNode<P>) => node.visited && node !== startNode)
      .map(n => n.point.coords);
    throw new NoValidPathError(visited);
  }
}
