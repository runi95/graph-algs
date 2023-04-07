import test from 'ava';
import * as fs from 'fs-extra';
import {JPS} from '../src/algorithms/JPS';
import {Node} from '../src/algorithms/node';
import {Point2D} from '../src/algorithms/point2d';
import {ManhattanDistance} from '../src/heuristics/manhattanDistance';

test('should find a valid 2D path from source to destination', t => {
    t.timeout(15000);
    const dimensions = [32, 20];
    const adjMatrix2D = [...Array(dimensions[0])]
        .map((_, x) => [...Array(dimensions[1])]
        .map((_, y) => new Node<Point2D>(new Point2D(x, y), false)))
        .flat();
    const graph = {
        dimensions,
        nodes: adjMatrix2D
    };

    // Basic
    t.snapshot(new JPS<Point2D>(graph).search(
        new Point2D(1, 18),
        new Point2D(30, 1),
        new ManhattanDistance()
    ));

    const mazeFile = fs.readFileSync(`${__dirname}/../templates/Maze.json`);
    const maze = JSON.parse(mazeFile.toString('utf8'));
    const nodes = maze
                .map((_: never, x: number) => maze[x]
                .map((_: never, y: number) => new Node(new Point2D(x, y), maze[x][y] === 'Wall')))
                .flat();

    // Advanced
    t.snapshot(new JPS<Point2D>({dimensions, nodes}).search(
        new Point2D(1, 18),
        new Point2D(30, 1),
        new ManhattanDistance()
    ));
});
