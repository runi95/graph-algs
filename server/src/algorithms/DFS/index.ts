import {AStarNode} from '../aStar/node';
import {ClientMatrix, Graph} from '../graph';
import {LinkedList} from '../linkedList';
import {NoValidPathError} from '../noValidPathError';
import {Point} from '../point';

export class DepthFirstSearch<P extends Point> {
  public static readonly label = 'DFS';
  public static readonly usesHeuristics = false;
  private readonly graph: Graph<P, AStarNode<P>>;

  constructor(clientMatrix: ClientMatrix<P>) {
    this.graph = new Graph(
      clientMatrix.dimensions,
      clientMatrix.nodes.map(n => new AStarNode(n))
    );
  }

  private neighbors(node: AStarNode<P>): AStarNode<P>[] {
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

  public search(source: P, destination: P) {
    const toVisitLinkedList = new LinkedList<AStarNode<P>>();
    toVisitLinkedList.add(this.graph.get(source));
    const sourceIndex = this.graph.point2Index(source);
    const destinationIndex = this.graph.point2Index(destination);
    let next;
    const visited: number[][] = [];
    while ((next = toVisitLinkedList.poll()) !== null) {
        if (next === null) continue;
        if (next.visited) continue;
        const i = this.graph.point2Index(next.point);
        if (i === destinationIndex) {
            let curr = next.parent as AStarNode<P>;
            const ret = [];
            while (curr.parent) {
              ret.push(curr.point.coords);
              curr = curr.parent;
            }

            return {solution: ret.reverse(), visited};
        }
        if (i !== sourceIndex) {
            visited.push(next.point.coords);
        }
        next.visited = true;
        next.closed = true;
        for (const neighbor of this.neighbors(next)) {
            if (neighbor.visited || neighbor.closed) continue;
            neighbor.parent = next;
            toVisitLinkedList.addFirst(neighbor);
        }
    }

    throw new NoValidPathError(visited);
  }
}
