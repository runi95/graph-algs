import {Node} from './node';
import {Point} from './point';

export interface ClientMatrix<P extends Point> {
    dimensions: number[],
    nodes: Node<P>[],
}

export class Graph<P extends Point, N extends Node<P>> {
    public readonly dimensions: number[];
    public readonly nodes: N[];
    public readonly dMul: number[];

    constructor(dimensions: number[], nodes: N[]) {
        this.dimensions = dimensions;
        this.nodes = nodes;

        let mul = 1;
        const dMul = [];
        for (let i = 0; i < this.dimensions.length; i++) {
            dMul.push(mul);
            mul *= this.dimensions[i];
        }
        this.dMul = dMul;
    }

    public point2Index(point: P): number {
        let nodeIndex = 0;
        for(let i = 0; i < this.dimensions.length; i++) {
            nodeIndex += this.dMul[i] * point.coords[i];
        }

        return nodeIndex;
    }

    public get(point: P): N {
        return this.nodes[this.point2Index(point)];
    }
}
