import {EuclideanDistance} from '../../heuristics/euclideanDistance';
import {Heuristics} from '../../heuristics/heuristicsInterface';
import {ThetaStarNode} from '../ThetaStar/node';
import {ClientMatrix, Graph} from '../graph';
import {NoValidPathError} from '../noValidPathError';
import {Point} from '../point';
import {PriorityQueue} from '../priorityQueue';

export class LazyThetaStar<P extends Point> {
  public static readonly label = 'Lazy Theta*';
  public static readonly usesHeuristics = true;
  private readonly graph: Graph<P, ThetaStarNode<P>>;
  private readonly c = new EuclideanDistance();

  constructor(clientMatrix: ClientMatrix<P>) {
    this.graph = new Graph(
      clientMatrix.dimensions,
      clientMatrix.nodes.map(n => new ThetaStarNode(n))
    );
  }

  private neighbors(node: ThetaStarNode<P>): ThetaStarNode<P>[] {
    const ret = [];
    const pointRef = this.graph.point2Index(node.point);
    for (let i = 0; i < this.graph.dimensions.length; i++) {
      if (node.point.coords[i] + 1 < this.graph.dimensions[i]) {
        const n = this.graph.nodes[pointRef + this.graph.dMul[i]];
        if (!n.isWall) {
          ret.push(n);
        }
      }

      if (node.point.coords[i] > 0) {
        const n = this.graph.nodes[pointRef - this.graph.dMul[i]];
        if (!n.isWall) {
          ret.push(n);
        }
      }
    }

    return ret;
  }

  // Note: This function should probably be rewritten at some point
  private lineOfSight(a: ThetaStarNode<P>, b: ThetaStarNode<P>) {
    const d = b.point.distanceMatrix(a.point);
    const abs = d.map((v) => Math.abs(v));
    const signs = d.map((v) => Math.sign(v));
    let pointRef = this.graph.point2Index(a.point);
    const destinationPointRef = this.graph.point2Index(b.point);
    while (pointRef !== destinationPointRef) {
      const largestDistanceIndex = abs.reduce(
        (acc, curr, i) => curr > abs[acc] ? i : acc, 0);
      pointRef +=
        signs[largestDistanceIndex] * this.graph.dMul[largestDistanceIndex];
      d[largestDistanceIndex] += signs[largestDistanceIndex];
      abs[largestDistanceIndex] -= 1;
      if (this.graph.nodes[pointRef].isWall) return false;
    }

    return true;
  }

  public search(
    source: P,
    destination: P,
    heuristic: Heuristics<P>
  ) {
    const sourceNode = this.graph.get(source);
    sourceNode.g = 0;
    sourceNode.parent = sourceNode;
    sourceNode.h = sourceNode.g + heuristic.calculate(destination, source);

    const openHeap = new PriorityQueue<ThetaStarNode<P>>();
    openHeap.add(sourceNode);
  
    const visited: number[][] = [];
    const destinationNode = this.graph.get(destination);

    while (openHeap.size > 0) {
      const currentNode = openHeap.poll() as ThetaStarNode<P>;

      if (currentNode === destinationNode) {
        let curr = currentNode.parent as ThetaStarNode<P>;
        const ret = [];
        while (curr.parent) {
          if (curr === sourceNode) break;
          ret.push(curr.point.coords);
          curr = curr.parent;
        }

        return {solution: ret.reverse(), visited};
      }

      const parent = currentNode.parent as ThetaStarNode<P>;
      const neighbors = this.neighbors(currentNode);
      if (!this.lineOfSight(parent, currentNode)) {
        currentNode.g = Number.POSITIVE_INFINITY;

        for (const neighbor of neighbors) {
          if (neighbor.closed) {
            const newG = neighbor.g + 1;
            if (newG < currentNode.g) {
                currentNode.g = newG;
                currentNode.parent = neighbor;
            }
          }
        }
      }

      currentNode.closed = true;

      for (const neighbor of neighbors) {
        if (neighbor.closed) continue;

        neighbor.visited = true;
        if (neighbor !== destinationNode) {
          visited.push(neighbor.point.coords);
        }

        const newG = parent.g + this.c.calculate(parent.point, neighbor.point);
        if (newG < neighbor.g) {
          openHeap.remove(neighbor);

          neighbor.parent = currentNode.parent;
          neighbor.g = newG;

          neighbor.h = neighbor.g +
              heuristic.calculate(destination, neighbor.point);
          openHeap.add(neighbor);
        }
      }
    }

    throw new NoValidPathError(visited);
  }
}
