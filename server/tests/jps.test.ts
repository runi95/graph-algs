import test from 'ava';
import {JPS} from '../src/algorithms/JPS';
import {Node} from '../src/algorithms/node';
import {Point2D} from '../src/algorithms/point2d';
import {ManhattanDistance} from '../src/heuristics/manhattanDistance';

test('should find a valid 2D path from source to destination', t => {
    t.timeout(15000);
    const dimensions = [32, 20];
    const adjMatrix2D = [...Array(dimensions[0])].map((_, x) => [...Array(dimensions[1])].map((_, y) => new Node<Point2D>(new Point2D(x, y), false))).flat();

    // Basic
    t.snapshot(new JPS<Point2D>({dimensions, nodes: adjMatrix2D}).search([1, 18], [30, 1], new ManhattanDistance()));
});
