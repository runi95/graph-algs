import {PriorityQueue} from '../priorityQueue';
import {AStarNode} from '../AStar/node';
import {OctileDistance} from '../../heuristics/octileDistance';
import {Heuristics} from '../../heuristics/heuristicsInterface';
import {Point2D} from '../point2d';
import {Graph} from '../graph';

const octileDistance = new OctileDistance();

export class JPS {
  static label = 'Jump point';
  static usesHeuristics = true;

  private readonly dimensions: number[];
  private graph: AStarNode<Point2D>[];

  constructor(graph: Graph<Point2D>) {
    this.dimensions = graph.dimensions;
    this.graph = graph.nodes.map(p => new AStarNode(p));
  }

  private neighbors(node: AStarNode<Point2D>): AStarNode<Point2D>[] {
    const ret = [];
    const parent = node.parent;
    const x = node.node.point.x;
    const y = node.node.point.y;

    if (parent) {
      const px = parent.node.point.x;
      const py = parent.node.point.y;

      const dx = (x - px) / Math.max(Math.abs(x - px), 1);
      const dy = (y - py) / Math.max(Math.abs(y - py), 1);

      if (dx !== 0) {
        if (this.isPathable(x, y - 1)) {
          ret.push(this.graph[x * this.dimensions[1] + y - 1]);
        }

        if (this.isPathable(x, y + 1)) {
          ret.push(this.graph[x * this.dimensions[1] + y + 1]);
        }

        if (this.isPathable(x + dx, y)) {
          ret.push(this.graph[(x + dx) * this.dimensions[1] + y]);
        }
      } else if (dy !== 0) {
        if (this.isPathable(x - 1, y)) {
          ret.push(this.graph[(x - 1) * this.dimensions[1] + y]);
        }

        if (this.isPathable(x + 1, y)) {
          ret.push(this.graph[(x + 1) * this.dimensions[1] + y]);
        }

        if (this.isPathable(x, y + dy)) {
          ret.push(this.graph[x * this.dimensions[1] + y + dy]);
        }
      }
    } else {
      if (this.isPathable(x + 1, y)) {
        ret.push(this.graph[(x + 1) * this.dimensions[1] + y]);
      }

      if (this.isPathable(x - 1, y)) {
        ret.push(this.graph[(x - 1) * this.dimensions[1] + y]);
      }

      if (this.isPathable(x, y + 1)) {
        ret.push(this.graph[x * this.dimensions[1] + y + 1]);
      }

      if (this.isPathable(x, y - 1)) {
        ret.push(this.graph[x * this.dimensions[1] + y - 1]);
      }
    }

    return ret;
  }

  private isPathable(x: number, y: number): boolean {
    if (x < 0) {
      return false;
    }

    if (y < 0) {
      return false;
    }

    if (x >= this.dimensions[0]) {
      return false;
    }

    if (y >= this.dimensions[1]) {
      return false;
    }

    return !this.graph[x * this.dimensions[1] + y].node.isWall;
  }

  private jump(x: number, y: number, px: number, py: number, destinationX: number, destinationY: number): number[] | null {
    const dx = x - px;
    const dy = y - py;

    if (x < 0 ||
      y < 0 ||
      x >= this.dimensions[0] ||
      y >= this.dimensions[1]
    ) {
      return null;
    }

    if (this.graph[x * this.dimensions[1] + y].node.isWall) {
      return null;
    }

    if (x === destinationX && y === destinationY) {
      return [x, y];
    }

    if (dx !== 0) {
      if (
        (this.isPathable(x, y - 1) &&
          !this.isPathable(x - dx, y - 1)) ||
        (this.isPathable(x, y + 1) &&
          !this.isPathable(x - dx, y + 1))
      ) {
        return [x, y];
      }
    } else if (dy !== 0) {
      if (
        (this.isPathable(x - 1, y) &&
          !this.isPathable(x - 1, y - dy)) ||
        (this.isPathable(x + 1, y) &&
          !this.isPathable(x + 1, y - dy))
      ) {
        return [x, y];
      }

      if (this.jump(x + 1, y, x, y, destinationX, destinationY) ||
        this.jump(x - 1, y, x, y, destinationX, destinationY)
      ) {
        return [x, y];
      }
    } else {
      throw new Error('Only horizontal and vertical movements are allowed');
    }

    return this.jump(x + dx, y + dy, x, y, destinationX, destinationY);
  }

  public search(source: number[], destination: number[], heuristic: Heuristics<Point2D>) {
    const openHeap = new PriorityQueue<AStarNode<Point2D>>();
    openHeap.add(this.graph[source[0] * this.dimensions[1] + source[1]]);

    while (openHeap.size > 0) {
      const currentNode = openHeap.poll() as AStarNode<Point2D>;
      currentNode.closed = true;

      if (currentNode.node.point.x === destination[0] && currentNode.node.point.y === destination[1]) {
        let curr = currentNode.parent as AStarNode<Point2D>;
        const path: Point2D[] = [];
        while (curr.parent) {
          path.push(new Point2D(curr.node.point.x, curr.node.point.y));
          curr = curr.parent;
        }

        path.push(new Point2D(source[0], source[1]));

        const visitedFilter = (node: AStarNode<Point2D>) => node.visited && node !== currentNode;
        const visited = this.graph
          .flat()
          .filter(visitedFilter)
          .map((n) => (n.node.point.coords));

        const solution = path
          .reduce((acc: number[][], curr: Point2D, currentIndex: number) => {
            let prevNode: number[];
            if (currentIndex === 0) {
              prevNode = currentNode.node.point.coords;
            } else {
              prevNode = acc[acc.length - 1];
            }

            const arr: number[][] = [];
            const dx = curr.x - prevNode[0];
            const lx = Math.abs(dx);
            for (let i = 1; i < lx + 1; i++) {
              arr.push([prevNode[0] + i * (dx / lx), prevNode[1]]);
            }

            const dy = curr.y - prevNode[1];
            const ly = Math.abs(dy);
            for (let i = 1; i < ly + 1; i++) {
              arr.push([prevNode[0], prevNode[1] + i * (dy / ly)]);
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
          neighbor.node.point.x,
          neighbor.node.point.y,
          currentNode.node.point.x,
          currentNode.node.point.y,
          destination[0],
          destination[1],
        );

        if (jumpPoint) {
          const jx = jumpPoint[0];
          const jy = jumpPoint[1];
          const jumpNode = this.graph[jx * this.dimensions[1] + jy];

          if (jumpNode.closed || jumpNode.node.isWall) {
            continue;
          }

          const d = octileDistance.calculate(
            neighbor.node.point,
            new Point2D(destination[0], destination[1])
          );
          const gScore = currentNode.g + d;
          const beenVisited = neighbor.visited;
          if (!beenVisited || gScore < jumpNode.g) {
            jumpNode.visited = true;
            jumpNode.parent = currentNode;
            jumpNode.h = neighbor.h || heuristic.calculate(
              neighbor.node.point,
              new Point2D(destination[0], destination[1])
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
