import {Node} from './node';
import {Point} from './point';

export interface Graph<P extends Point> {
    dimensions: number[];
    nodes: Node<P>[];
}
