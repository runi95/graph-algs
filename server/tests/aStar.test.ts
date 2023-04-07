import test from 'ava';
import {AStar} from '../src/algorithms/aStar';
import {Node} from '../src/algorithms/node';
import {Point2D} from '../src/algorithms/point2d';
import {Point3D} from '../src/algorithms/point3d';
import {CanberraDistance} from '../src/heuristics/canberraDistance';
import {ChebyshevDistance} from '../src/heuristics/chebyshevDistance';
import {EuclideanDistance} from '../src/heuristics/euclideanDistance';
import {ManhattanDistance} from '../src/heuristics/manhattanDistance';
import {OctileDistance} from '../src/heuristics/octileDistance';

test('should find a valid 2D path from source to destination', t => {
    const size = 100;
    const adjMatrix2D = [...Array(size)]
        .map((_, y) => [...Array(size)]
        .map((_, x) => new Node<Point2D>(new Point2D(x, y), false)))
        .flat();
    const graph = {
        dimensions: [size, size],
        nodes: adjMatrix2D
    };
    
    // Basic
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(1, 1), new Point2D(99, 99), new ManhattanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(99, 99), new Point2D(1, 1), new ManhattanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(1, 1), new Point2D(99, 99), new CanberraDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(99, 99), new Point2D(1, 1), new CanberraDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(1, 1), new Point2D(99, 99), new EuclideanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(99, 99), new Point2D(1, 1), new EuclideanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(new Point2D(1, 1), new Point2D(99, 99), new OctileDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(new Point2D(99, 99), new Point2D(1, 1), new OctileDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(1, 1), new Point2D(99, 99), new ChebyshevDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(99, 99), new Point2D(1, 1), new ChebyshevDistance()));

    // Advanced
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(83, 65), new Point2D(62, 35), new ManhattanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(62, 26), new Point2D(57, 19), new ManhattanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(32, 38), new Point2D(84, 45), new ManhattanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(83, 65), new Point2D(62, 35), new CanberraDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(62, 26), new Point2D(57, 19), new CanberraDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(32, 38), new Point2D(84, 45), new CanberraDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(83, 65), new Point2D(62, 35), new EuclideanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(62, 26), new Point2D(57, 19), new EuclideanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(32, 38), new Point2D(84, 45), new EuclideanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(83, 65), new Point2D(62, 35), new OctileDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(62, 26), new Point2D(57, 19), new OctileDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(32, 38), new Point2D(84, 45), new OctileDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(83, 65), new Point2D(62, 35), new ChebyshevDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(62, 26), new Point2D(57, 19), new ChebyshevDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search(
            new Point2D(32, 38), new Point2D(84, 45), new ChebyshevDistance()));
});

test('should find a valid 3D path from source to destination', t => {
    const size = 100;
    const adjMatrix3D = [...Array(size)]
        .map((_, z) => [...Array(size)]
        .map((_, y) => [...Array(size)]
        .map((_, x) => new Node<Point3D>(new Point3D(x, y, z), false))))
        .flat()
        .flat();
    const graph = {
        dimensions: [size, size, size],
        nodes: adjMatrix3D
    };

    // Basic
    t.snapshot(new AStar<Point3D>(graph).search(
            new Point3D(1, 1, 1),
            new Point3D(99, 99, 99),
            new ManhattanDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
            new Point3D(99, 99, 99),
            new Point3D(1, 1, 1),
            new ManhattanDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
            new Point3D(1, 1, 1),
            new Point3D(99, 99, 99),
            new CanberraDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(99, 99, 99),
        new Point3D(1, 1, 1),
        new CanberraDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(1, 1, 1),
        new Point3D(99, 99, 99),
        new EuclideanDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(99, 99, 99),
        new Point3D(1, 1, 1),
        new EuclideanDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(1, 1, 1),
        new Point3D(99, 99, 99),
        new OctileDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(99, 99, 99),
        new Point3D(1, 1, 1),
        new OctileDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(1, 1, 1),
        new Point3D(99, 99, 99),
        new ChebyshevDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(99, 99, 99),
        new Point3D(1, 1, 1),
        new ChebyshevDistance()
    ));

    // Advanced
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(83, 65, 83),
        new Point3D(62, 35, 43),
        new ManhattanDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(62, 26, 9),
        new Point3D(57, 19, 8),
        new ManhattanDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(32, 38, 89),
        new Point3D(84, 45, 33),
        new ManhattanDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(83, 65, 60),
        new Point3D(62, 35, 38),
        new CanberraDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(62, 26, 46),
        new Point3D(57, 19, 57),
        new CanberraDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(32, 38, 69),
        new Point3D(84, 45, 41),
        new CanberraDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(83, 65, 65),
        new Point3D(62, 35, 96),
        new EuclideanDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(62, 26, 48),
        new Point3D(57, 19, 25),
        new EuclideanDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(32, 38, 78),
        new Point3D(84, 45, 17),
        new EuclideanDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(83, 65, 29),
        new Point3D(62, 35, 95),
        new OctileDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(62, 26, 12),
        new Point3D(57, 19, 10),
        new OctileDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(32, 38, 72),
        new Point3D(84, 45, 9),
        new OctileDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(83, 65, 54),
        new Point3D(62, 35, 56),
        new ChebyshevDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(62, 26, 51),
        new Point3D(57, 19, 30),
        new ChebyshevDistance()
    ));
    t.snapshot(new AStar<Point3D>(graph).search(
        new Point3D(32, 38, 14),
        new Point3D(84, 45, 84),
        new ChebyshevDistance()
    ));
});
