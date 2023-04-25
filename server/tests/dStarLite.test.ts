import test from 'ava';
import {Node} from '../src/algorithms/node';
import {Point2D} from '../src/algorithms/point2d';
import {ManhattanDistance} from '../src/heuristics/manhattanDistance';
import {DStarLite} from '../src/algorithms/DStarLite';

test('should find a valid 2D path from source to destination', t => {
    const size = 2;
    const adjMatrix2D = [...Array(size)]
        .map((_, y) => [...Array(size)]
        .map((_, x) => new Node<Point2D>(new Point2D(x, y), false)))
        .flat();
    const graph = {
        dimensions: [size, size],
        nodes: adjMatrix2D
    };
    
    // Basic
    t.snapshot(new DStarLite<Point2D>(graph)
        .search(
            new Point2D(0, 0), new Point2D(1, 1), new ManhattanDistance()));
});
