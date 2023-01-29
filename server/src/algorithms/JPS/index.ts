import {PriorityQueue} from '../priorityQueue';
import {AStarNode} from '../AStar/node';
import {OctileDistance} from '../../heuristics/octileDistance';
import {Heuristics} from '../../heuristics/heuristicsInterface';
import {Point} from '../point';
import {Graph} from '../graph';
import {NoValidPathError} from '../noValidPathError';

const octileDistance = new OctileDistance();

export class JPS<P extends Point> {
  public static readonly label = 'Jump point';
  public static readonly usesHeuristics = true;

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

    let pointRef = 0;
    for (let i = 0; i < this.dimensions.length; i++) {
      pointRef += node.node.point.coords[i] * dMul[i];
    }

    if (parent) {
      const d = [];
      for (let i = 0; i < this.dimensions.length; i++) {
        const dx = node.node.point.coords[i] - parent.node.point.coords[i];
        d.push((dx) / Math.max(Math.abs(dx), 1));
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

          if (
            node.node.point.coords[di] + d[di] < this.dimensions[di] &&
            node.node.point.coords[di] + d[di] >= 0
          ) {
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

  private jump(
    neighbor: number[],
    current: AStarNode<P>,
    destination: AStarNode<P>
  ): number[] | null {
    if (!neighbor) return null;

    const d: number[] = [];
    for (let i = 0; i < this.dimensions.length; i++) {
      d.push(neighbor[i] - current.node.point.coords[i]);
    }

    for (let i = 0; i < neighbor.length; i++) {
      if (neighbor[i] < 0) return null;
      if (neighbor[i] >= this.dimensions[i]) return null;
    }

    let mul = 1;
    const dMul = [];
    for (let i = this.dimensions.length - 1; i >= 0; i--) {
      dMul.push(mul);
      mul *= this.dimensions[i];
    }

    let pointRef = 0;
    for (let i = 0; i < this.dimensions.length; i++) {
      pointRef += neighbor[i] * dMul[i];
    }

    if (this.graph[pointRef].node.isWall) {
      return null;
    }

    if (neighbor.every((v, i) => v === destination.node.point.coords[i])) {
      return neighbor;
    }

    let noDir = true;
    for (let di = 0; di < d.length; di++) {
      if (d[di] !== 0) {
        noDir = false;
        for (let i = 0; i < this.dimensions.length; i++) {
          if (i === di) continue;
          if (neighbor[i] - 1 >= 0) {
            const n = this.graph[pointRef - dMul[i]];
            if (!n.node.isWall) {
              let checkPointRef = pointRef - dMul[i];
              for (let j = 0; j < this.dimensions.length; j++) {
                if (j === i) continue;
                checkPointRef -= d[j] * dMul[j];
              }

              if (
                checkPointRef < 0 ||
                checkPointRef >= this.graph.length ||
                this.graph[checkPointRef].node.isWall
              ) {
                return neighbor;
              }
            }
          }

          if (neighbor[i] + 1 < this.dimensions[i]) {
            const n = this.graph[pointRef + dMul[i]];
            if (!n.node.isWall) {
              let checkPointRef = pointRef + dMul[i];
              for (let j = 0; j < this.dimensions.length; j++) {
                if (j === i) continue;
                checkPointRef -= d[j] * dMul[j];
              }

              if (
                checkPointRef < 0 ||
                checkPointRef >= this.graph.length ||
                this.graph[checkPointRef].node.isWall
              ) {
                return neighbor;
              }
            }
          }
        }

        if (di === 0) {
          break;
        } else {
          if (this.jump(neighbor.map((v, i) => {
            if (i === 0) return v + 1;
            return v;
          }), this.graph[pointRef], destination) ||
            this.jump(neighbor.map((v, i) => {
              if (i === 0) return v - 1;
              return v;
            }), this.graph[pointRef], destination)
          ) {
            return neighbor;
          }
        }

        break;
      }
    }

    if (noDir) {
      throw new Error('Only horizontal and vertical movements are allowed');
    }

    return this.jump(
      neighbor.map((v, i) => v + d[i]), this.graph[pointRef],
      destination
    );
  }

  public search(
    source: number[],
    destination: number[],
    heuristic: Heuristics<P>
  ) {
    const openHeap = new PriorityQueue<AStarNode<P>>();
    let mul = 1;
    const dMul = [];
    for (let i = this.dimensions.length - 1; i >= 0; i--) {
      dMul.push(mul);
      mul *= this.dimensions[i];
    }

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
      currentNode.closed = true;

      if (currentNode === destinationNode) {
        let curr = currentNode.parent as AStarNode<P>;
        const path: number[][] = [];
        while (curr.parent) {
          path.push(curr.node.point.coords);
          curr = curr.parent;
        }

        path.push(source);

        const visitedFilter = 
          (node: AStarNode<P>) => node.visited && node !== currentNode;
        const visited = this.graph
          .filter(visitedFilter)
          .map((n) => n.node.point.coords);

        const solution = path
          .reduce((acc: number[][], curr: number[], currentIndex: number) => {
            let prevNode: number[];
            if (currentIndex === 0) {
              prevNode = currentNode.node.point.coords;
            } else {
              prevNode = acc[acc.length - 1];
            }

            const arr: number[][] = [];

            const d = [];
            const l = [];
            for (let i = 0; i < this.dimensions.length; i++) {
              d.push(curr[i] - prevNode[i]);
              l.push(Math.abs(d[i]));
            }

            for (let i = 0; i < this.dimensions.length; i++) {
              for (let j = 1; j < l[i] + 1; j++) {
                const p = [];
                for (let k = 0; k < this.dimensions.length; k++) {
                  if (k === i) {
                    p.push(prevNode[k] + j * (d[i] / l[i]));
                  } else {
                    p.push(prevNode[k]);
                  }
                }
                arr.push(p);
              }
            }

            return [...acc].concat(arr);
          }, [])
          .slice(0, -1)
          .reverse();
        return {solution, visited};
      }

      const neighbors = this.neighbors(currentNode);
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        const jumpPoint = this.jump(
          neighbor.node.point.coords,
          currentNode,
          destinationNode,
        );

        if (jumpPoint) {
          let jumpPointPointRef = 0;
          for (let i = 0; i < this.dimensions.length; i++) {
            jumpPointPointRef += jumpPoint[i] * dMul[i];
          }

          const jumpNode = this.graph[jumpPointPointRef];

          if (jumpNode.closed || jumpNode.node.isWall) {
            continue;
          }

          const d = octileDistance.calculate(
            neighbor.node.point,
            destinationNode.node.point,
          );
          const gScore = currentNode.g + d;
          const beenVisited = neighbor.visited;
          if (!beenVisited || gScore < jumpNode.g) {
            jumpNode.visited = true;
            jumpNode.parent = currentNode;
            jumpNode.h = neighbor.h || heuristic.calculate(
              neighbor.node.point,
              destinationNode.node.point,
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

    const visited = this.graph
      .filter((node: AStarNode<P>) => node.visited)
      .map(n => n.node.point.coords);
    throw new NoValidPathError(visited);
  }
}
