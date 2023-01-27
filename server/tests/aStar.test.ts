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
    t.timeout(15000);
    const size = 100;
    const adjMatrix2D = [...Array(size)]
        .map((_, x) => [...Array(size)]
        .map((_, y) => new Node<Point2D>(new Point2D(x, y), false)))
        .flat();
    const graph = {
        dimensions: [size, size],
        nodes: adjMatrix2D
    };
    
    // Basic
    t.snapshot(new AStar<Point2D>(graph)
        .search([1, 1], [99, 99], new ManhattanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([99, 99], [1, 1], new ManhattanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([1, 1], [99, 99], new CanberraDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([99, 99], [1, 1], new CanberraDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([1, 1], [99, 99], new EuclideanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([99, 99], [1, 1], new EuclideanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([1, 1], [99, 99], new OctileDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([99, 99], [1, 1], new OctileDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([1, 1], [99, 99], new ChebyshevDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([99, 99], [1, 1], new ChebyshevDistance()));

    // Advanced
    t.snapshot(new AStar<Point2D>(graph)
        .search([83, 65], [62, 35], new ManhattanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([62, 26], [57, 19], new ManhattanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([32, 38], [84, 45], new ManhattanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([83, 65], [62, 35], new CanberraDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([62, 26], [57, 19], new CanberraDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([32, 38], [84, 45], new CanberraDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([83, 65], [62, 35], new EuclideanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([62, 26], [57, 19], new EuclideanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([32, 38], [84, 45], new EuclideanDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([83, 65], [62, 35], new OctileDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([62, 26], [57, 19], new OctileDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([32, 38], [84, 45], new OctileDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([83, 65], [62, 35], new ChebyshevDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([62, 26], [57, 19], new ChebyshevDistance()));
    t.snapshot(new AStar<Point2D>(graph)
        .search([32, 38], [84, 45], new ChebyshevDistance()));
});

test('should find a valid 3D path from source to destination', t => {
    t.timeout(15000);
    const size = 100;
    const adjMatrix3D = [...Array(size)]
        .map((_, x) => [...Array(size)]
        .map((_, y) => [...Array(size)]
        .map((_, z) => new Node<Point3D>(new Point3D(x, y, z), false))))
        .flat()
        .flat();
    const graph = {
        dimensions: [size, size, size],
        nodes: adjMatrix3D
    };

    // Basic
    t.snapshot(new AStar<Point3D>(graph)
        .search([1, 1, 1], [99, 99, 99], new ManhattanDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([99, 99, 99], [1, 1, 1], new ManhattanDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([1, 1, 1], [99, 99, 99], new CanberraDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([99, 99, 99], [1, 1, 1], new CanberraDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([1, 1, 1], [99, 99, 99], new EuclideanDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([99, 99, 99], [1, 1, 1], new EuclideanDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([1, 1, 1], [99, 99, 99], new OctileDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([99, 99, 99], [1, 1, 1], new OctileDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([1, 1, 1], [99, 99, 99], new ChebyshevDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([99, 99, 99], [1, 1, 1], new ChebyshevDistance()));

    // Advanced
    t.snapshot(new AStar<Point3D>(graph)
        .search([83, 65, 83], [62, 35, 43], new ManhattanDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([62, 26, 9], [57, 19, 8], new ManhattanDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([32, 38, 89], [84, 45, 33], new ManhattanDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([83, 65, 60], [62, 35, 38], new CanberraDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([62, 26, 46], [57, 19, 57], new CanberraDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([32, 38, 69], [84, 45, 41], new CanberraDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([83, 65, 65], [62, 35, 96], new EuclideanDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([62, 26, 48], [57, 19, 25], new EuclideanDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([32, 38, 78], [84, 45, 17], new EuclideanDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([83, 65, 29], [62, 35, 95], new OctileDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([62, 26, 12], [57, 19, 10], new OctileDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([32, 38, 72], [84, 45, 9], new OctileDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([83, 65, 54], [62, 35, 56], new ChebyshevDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([62, 26, 51], [57, 19, 30], new ChebyshevDistance()));
    t.snapshot(new AStar<Point3D>(graph)
        .search([32, 38, 14], [84, 45, 84], new ChebyshevDistance()));
});
