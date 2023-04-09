import {PriorityQueue} from '../priorityQueue';
import {AStarNode} from '../AStar/node';
import {OctileDistance} from '../../heuristics/octileDistance';
import {Heuristics} from '../../heuristics/heuristicsInterface';
import {Point} from '../point';
import {ClientMatrix, Graph} from '../graph';
import {NoValidPathError} from '../noValidPathError';

const octileDistance = new OctileDistance();

export class JPS<P extends Point> {
  public static readonly label = 'Jump point';
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

    const pointRef = this.graph.point2Index(node.point);
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
            if (node.point.coords[i] > 0) {
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

        if (node.point.coords[i] > 0) {
          const n = this.graph.nodes[pointRef - this.graph.dMul[i]];
          if (!n.isWall) {
            ret.push(n);
          }
        }
      }
    }

    return ret;
  }

  private jump(
    neighbor: P,
    current: AStarNode<P>,
    destination: AStarNode<P>
  ): P | null {
    if (!neighbor) return null;

    const d: number[] = [];
    for (let i = 0; i < this.graph.dimensions.length; i++) {
      d.push(neighbor.coords[i] - current.point.coords[i]);
    }

    for (let i = 0; i < neighbor.coords.length; i++) {
      if (neighbor.coords[i] < 0) return null;
      if (neighbor.coords[i] >= this.graph.dimensions[i]) return null;
    }

    const pointRef = this.graph.point2Index(neighbor);
    if (this.graph.nodes[pointRef].isWall) {
      return null;
    }

    if (neighbor.coords.every((v, i) => v === destination.point.coords[i])) {
      return neighbor;
    }

    let noDir = true;
    for (let di = 0; di < d.length; di++) {
      if (d[di] === 0) continue;

      noDir = false;
      for (let i = 0; i < this.graph.dimensions.length; i++) {
        if (i === di) continue;
        if (neighbor.coords[i] > 0) {
          const n = this.graph.nodes[pointRef - this.graph.dMul[i]];
          if (!n.isWall) {
            let checkPointRef = pointRef - this.graph.dMul[i];
            for (let j = 0; j < this.graph.dimensions.length; j++) {
              if (j === i) continue;
              checkPointRef -= d[j] * this.graph.dMul[j];
            }

            if (
              checkPointRef < 0 ||
              checkPointRef >= this.graph.nodes.length ||
              this.graph.nodes[checkPointRef].isWall
            ) {
              return neighbor;
            }
          }
        }

        if (neighbor.coords[i] + 1 < this.graph.dimensions[i]) {
          const n = this.graph.nodes[pointRef + this.graph.dMul[i]];
          if (!n.isWall) {
            let checkPointRef = pointRef + this.graph.dMul[i];
            for (let j = 0; j < this.graph.dimensions.length; j++) {
              if (j === i) continue;
              checkPointRef -= d[j] * this.graph.dMul[j];
            }

            if (
              checkPointRef < 0 ||
              checkPointRef >= this.graph.nodes.length ||
              this.graph.nodes[checkPointRef].isWall
            ) {
              return neighbor;
            }
          }
        }
      }

      if (di === 0) {
        break;
      } else {
        if (
          this.jump(
            this.graph.nodes[pointRef + 1].point,
            this.graph.nodes[pointRef],
            destination
          ) ||
          this.jump(
            this.graph.nodes[pointRef - 1].point,
            this.graph.nodes[pointRef],
            destination
          )
        ) {
          return neighbor;
        }
      }

      break;
    }

    if (noDir) {
      throw new Error('Only horizontal and vertical movements are allowed');
    }

    let newPointRef = pointRef;
    for (let i = 0; i < this.graph.dimensions.length; i++) {
      if (d[i] < 0 && neighbor.coords[i] === 0) return null;
      if (
        d[i] > 0 &&
        neighbor.coords[i] + 1 >= this.graph.dimensions[i]
      ) return null;
      newPointRef += d[i] * this.graph.dMul[i];
    }

    if (newPointRef < 0) return null;
    if (newPointRef >= this.graph.nodes.length) return null;
    return this.jump(
      this.graph.nodes[newPointRef].point,
      this.graph.nodes[pointRef],
      destination
    );
  }

  public search(
    source: P,
    destination: P,
    heuristic: Heuristics<P>
  ) {
    const openHeap = new PriorityQueue<AStarNode<P>>();
    openHeap.add(this.graph.get(source));

    const visited: number[][] = [];
    const destinationNode = this.graph.get(destination);
    while (openHeap.size > 0) {
      const currentNode = openHeap.poll() as AStarNode<P>;
      currentNode.closed = true;

      if (currentNode === destinationNode) {
        let curr = currentNode.parent as AStarNode<P>;
        const path: number[][] = [];
        while (curr.parent) {
          path.push(curr.point.coords);
          curr = curr.parent;
        }

        path.push(source.coords);

        const solution = path
          .reduce((acc: number[][], curr: number[], currentIndex: number) => {
            let prevNode: number[];
            if (currentIndex === 0) {
              prevNode = currentNode.point.coords;
            } else {
              prevNode = acc[acc.length - 1];
            }

            const arr: number[][] = [];

            const d = [];
            const l = [];
            for (let i = 0; i < this.graph.dimensions.length; i++) {
              d.push(curr[i] - prevNode[i]);
              l.push(Math.abs(d[i]));
            }

            for (let i = 0; i < this.graph.dimensions.length; i++) {
              for (let j = 1; j < l[i] + 1; j++) {
                const p = [];
                for (let k = 0; k < this.graph.dimensions.length; k++) {
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
          neighbor.point,
          currentNode,
          destinationNode,
        );

        if (jumpPoint) {
          const jumpNode = this.graph.get(jumpPoint);
          if (jumpNode.closed || jumpNode.isWall) {
            continue;
          }

          const d = octileDistance.calculate(
            neighbor.point,
            destinationNode.point,
          );
          const gScore = currentNode.g + d;
          const beenVisited = neighbor.visited;
          if (!beenVisited || gScore < jumpNode.g) {
            visited.push(jumpNode.point.coords);
            jumpNode.visited = true;
            jumpNode.parent = currentNode;
            jumpNode.h = neighbor.h || heuristic.calculate(
              neighbor.point,
              destinationNode.point,
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

    throw new NoValidPathError(visited);
  }
}
