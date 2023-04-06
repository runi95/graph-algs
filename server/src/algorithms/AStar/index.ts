import {Heuristics} from '../../heuristics/heuristicsInterface';
import {ClientMatrix, Graph} from '../graph';
import {NoValidPathError} from '../noValidPathError';
import {Point} from '../point';
import {PriorityQueue} from '../priorityQueue';
import {AStarNode} from './node';

export class AStar<P extends Point> {
  public static readonly label = 'A*';
  public static readonly usesHeuristics = true;
  private readonly graph: Graph<P, AStarNode<P>>;

  constructor(clientMatrix: ClientMatrix<P>) {
    this.graph = new Graph(
      clientMatrix.dimensions,
      clientMatrix.nodes.map(n => new AStarNode(n))
    );
  }

  private neighbors(node: AStarNode<P>): AStarNode<P>[] {
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
        d.push((dx) / Math.max(Math.abs(dx), 1));
      }

      for (let di = 0; di < d.length; di++) {
        if (d[di] !== 0) {
          for (let i = 0; i < this.graph.dimensions.length; i++) {
            if (i === di) continue;
            if (node.point.coords[i] - 1 >= 0) {
              const n = this.graph.nodes[pointRef - this.graph.dMul[i]];
              if (!n.isWall) {
                ret.push(n);
              }
            }

            if (node.point.coords[i] + 1 < this.graph.dimensions[i]) {
              const n = this.graph.nodes[pointRef + this.graph.dMul[i]];
              if (!n.isWall) {
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
            if (!n.isWall) {
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
          if (!n.isWall) {
            ret.push(n);
          }
        }

        if (node.point.coords[i] - 1 >= 0) {
          const n = this.graph.nodes[pointRef - this.graph.dMul[i]];
          if (!n.isWall) {
            ret.push(n);
          }
        }
      }
    }

    return ret;
  }

  public search(
    source: number[],
    destination: number[],
    heuristic: Heuristics<P>
  ) {
    const openHeap = new PriorityQueue<AStarNode<P>>();

    let sourcePointRef = 0;
    for (let i = 0; i < this.graph.dimensions.length; i++) {
      sourcePointRef += source[i] * this.graph.dMul[i];
    }

    openHeap.add(this.graph.nodes[sourcePointRef]);

    let destinationPointRef = 0;
    for (let i = 0; i < this.graph.dimensions.length; i++) {
      destinationPointRef += destination[i] * this.graph.dMul[i];
    }

    const destinationNode = this.graph.nodes[destinationPointRef];
    while (openHeap.size > 0) {
      const currentNode = openHeap.poll() as AStarNode<P>;

      if (currentNode === destinationNode) {
        let curr = currentNode.parent as AStarNode<P>;
        const ret = [];
        while (curr.parent) {
          ret.push(curr.point.coords);
          curr = curr.parent;
        }

        const visitedFilter = 
          (node: AStarNode<P>) => node.visited && node !== currentNode;
        const visited = this.graph.nodes
          .filter(visitedFilter)
          .map(n => n.point.coords);
        return {solution: ret.reverse(), visited: visited};
      }

      currentNode.closed = true;

      const neighbors = this.neighbors(currentNode);
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
          neighbor.h = neighbor.h || heuristic.calculate(
            neighbor.point,
            destinationNode.point,
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

    const visited = this.graph.nodes
      .filter((node: AStarNode<P>) => node.visited)
      .map(n => n.point.coords);
    throw new NoValidPathError(visited);
  }
}
