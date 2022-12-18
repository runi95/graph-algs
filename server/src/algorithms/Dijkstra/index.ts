import {PriorityQueue} from '../priorityQueue';
import {AStarNode} from '../AStar/node';
import {Graph} from '../graph';
import {Point} from '../point';

export class Dijkstra<P extends Point> {
  public static readonly label = 'Dijkstra';
  public static readonly usesHeuristics = false;

  private readonly dimensions: number[];
  private graph: AStarNode<P>[];

  constructor(graph: Graph<P>) {
    this.dimensions = graph.dimensions;
    this.graph = graph.nodes.map(p => new AStarNode(p));
  }

  private neighbors(node: AStarNode<P>): AStarNode<P>[] {
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
        d.push((node.node.point.coords[i] - parent.node.point.coords[i]) / Math.max(Math.abs(node.node.point.coords[i] - parent.node.point.coords[i]), 1));
      }

      for (let di = 0; di < d.length; di++) {
        if (d[di] !== 0) {
          for (let i = 0; i < this.dimensions.length; i++) {

            if (i === di) continue;
            if (node.node.point.coords[i] - 1 >= 0) {
              const n = this.graph[pointRef - dMul[i]];
              if (!n.node.isWall) {
                ret.push(n);
              }
            }

            if (node.node.point.coords[i] + 1 < this.dimensions[i]) {
              const n = this.graph[pointRef + dMul[i]];
              if (!n.node.isWall) {
                ret.push(n);
              }
            }
          }

          if (node.node.point.coords[di] + d[di] < this.dimensions[di] && node.node.point.coords[di] + d[di] >= 0) {
            const n = this.graph[pointRef + (d[di] * dMul[di])];
            if (!n.node.isWall) {
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
          if (!n.node.isWall) {
            ret.push(n);
          }
        }

        if (node.node.point.coords[i] - 1 >= 0) {
          const n = this.graph[pointRef - dMul[i]];
          if (!n.node.isWall) {
            ret.push(n);
          }
        }
      }
    }

    return ret;
  }

  public search(source: number[], destination: number[]) {
    const openHeap = new PriorityQueue<AStarNode<P>>();
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

    openHeap.add(this.graph[sourcePointRef]);

    let destinationPointRef = 0;
    for (let i = 0; i < this.dimensions.length; i++) {
      destinationPointRef += destination[i] * dMul[i];
    }

    const destinationNode = this.graph[destinationPointRef];
    while (openHeap.size > 0) {
      const currentNode = openHeap.poll() as AStarNode<P>;

      if (currentNode === destinationNode) {
        let curr = currentNode.parent as AStarNode<P>;
        const ret = [];
        while (curr.parent) {
          ret.push(curr.node.point.coords);
          curr = curr.parent;
        }

        const visitedFilter = (node: AStarNode<P>) => node.visited && node !== currentNode;
        const visited = this.graph
          .flat()
          .filter(visitedFilter)
          .map(n => n.node.point.coords);
        return {solution: ret.reverse(), visited: visited};
      }

      currentNode.closed = true;

      const neighbors = this.neighbors(currentNode);
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];

        if (neighbor.closed || neighbor.node.isWall) {
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
