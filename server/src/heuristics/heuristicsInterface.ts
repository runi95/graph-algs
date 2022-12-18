import {Point} from '../algorithms/point';

export interface Heuristics<P extends Point> {
    calculate: (a: P, b: P) => number
}
