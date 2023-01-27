import {Point} from './point';

export class Node<P extends Point> {
    public readonly point: P;
    public readonly isWall: boolean;

    constructor(point: P, isWall: boolean) {
        this.point = point;
        this.isWall = isWall;
    }
}
