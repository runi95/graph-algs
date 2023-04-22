import {Heuristics} from '../../heuristics/heuristicsInterface';
import {ClientMatrix, Graph} from '../graph';
import {NoValidPathError} from '../noValidPathError';
import {Point} from '../point';
import {PriorityQueue} from '../priorityQueue';
import {DStarLiteNode} from './node';

export class DStarLite<P extends Point> {
  public static readonly label = 'D* Lite';
  public static readonly usesHeuristics = true;
  private readonly graph: Graph<P, DStarLiteNode<P>>;

  constructor(clientMatrix: ClientMatrix<P>) {
    this.graph = new Graph(
      clientMatrix.dimensions,
      clientMatrix.nodes.map(n => new DStarLiteNode(n))
    );
  }

  private calculateKey(
    s: DStarLiteNode<P>,
    start: DStarLiteNode<P>,
    heuristic: Heuristics<P>
  ) {
    const h = heuristic.calculate(start.point, s.point);
    return [
        Math.min(s.g, s.rhs) + h, // + k_m?
        Math.min(s.g, s.rhs)
    ];
  }

  private c(
    u: DStarLiteNode<P>,
    v: DStarLiteNode<P>,
    heuristic: Heuristics<P>
  ): number {
    if (u.isWall || v.isWall) return Number.POSITIVE_INFINITY;
    return heuristic.calculate(u.point, v.point);
  }

  private succ(u: DStarLiteNode<P>) {
    const keyIndex = this.graph.point2Index(u.point);
    const neighbors: DStarLiteNode<P>[] = [];
    for (let i = 0; i < this.graph.dimensions.length; i++) {
      if (u.point.coords[i] + 1 >= this.graph.dimensions[i]) continue;
      const n = this.graph.nodes[keyIndex + this.graph.dMul[i]];
      if (n.visited) continue;
      neighbors.push(n);
    }

    for (let i = 0; i < this.graph.dimensions.length; i++) {
      if (u.point.coords[i] - 1 < 0) continue;
      const n = this.graph.nodes[keyIndex - this.graph.dMul[i]];
      if (n.visited) continue;
      neighbors.push(n);
    }

    return neighbors;
  }

  public search(
    source: P,
    destination: P,
    heuristic: Heuristics<P>
  ) {
    const startNode = this.graph.get(source);
    const destinationNode = this.graph.get(destination);

    destinationNode.rhs = 0;
    destinationNode.key = [
        heuristic.calculate(
          startNode.point,
          destinationNode.point
        ),
        0
    ];

    const compareKey = (a: DStarLiteNode<P>, b: DStarLiteNode<P>) => {
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

    const openHeap = new PriorityQueue<DStarLiteNode<P>>(compareKey);
    openHeap.add(destinationNode);

    const updateVertex = (u: DStarLiteNode<P>) => {
        openHeap.remove(u);

        if (u.g !== u.rhs) {
            u.key = this.calculateKey(u, destinationNode, heuristic);
            openHeap.add(u);
        }
    }

    const visited: number[][] = [];

    let u: DStarLiteNode<P> | null;
    while ((u = openHeap.poll()) !== null) {
        u.visited = true;
        if (u !== startNode && u !== destinationNode) {
          visited.push(u.point.coords);
        }
        if (compareKey(u, startNode) >= 0) break;
        if (startNode.rhs > startNode.g) break;
        const k_old = u.key;
        const k_new = this.calculateKey(u, startNode, heuristic);

        if (k_old < k_new) {
          u.key = k_new;
          openHeap.add(u);
        } else if (u.g > u.rhs) {
          u.g = u.rhs;
          const pred: DStarLiteNode<P>[] = this.succ(u);
          for (const s of pred) {
            s.parent = u;
            if (s !== destinationNode) {
              s.rhs = Math.min(s.rhs, this.c(s, u, heuristic) + u.g);
            }

            updateVertex(s);
          }
        } else {
          const g_old = u.g;
          u.g = Number.POSITIVE_INFINITY;
          const pred: DStarLiteNode<P>[] = this.succ(u);
          pred.push(u);
          for (const s of pred) {
            if (s.rhs === this.c(s, u, heuristic) + g_old) {
              if (s !== destinationNode) {
                let min_s = Number.POSITIVE_INFINITY;
                let nparent = null;
                const succ: DStarLiteNode<P>[] = this.succ(u);
                for (const s_ of succ) {
                  const temp = this.c(s, s_, heuristic) + s_.g;
                  if (min_s > temp) {
                    nparent = s_;
                    min_s = temp;
                  }
                }

                s.rhs = min_s;
                s.parent = nparent;
              }
            }

            updateVertex(u);
          }
          openHeap.add(u);
        }
    }

    if (startNode.rhs < Number.POSITIVE_INFINITY) {
      let curr = startNode.parent as DStarLiteNode<P>;
      const ret: number[][] = [];
      while (curr.parent) {
        ret.push(curr.point.coords);
        curr = curr.parent;
      }

      return {solution: ret.reverse(), visited};
    }

    throw new NoValidPathError(visited);
  }
}
