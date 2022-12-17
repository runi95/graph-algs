import test from 'ava';
import {AStar} from '../src/algorithms/aStar';
import {EuclideanDistance} from '../src/heuristics/euclideanDistance';

test('should find a path from source node to destination node', t => {
    const size = 15;
    const adjMatrix = [...Array(size)].map(() => [...Array(size)].map(() => ''));

    const aStar = new AStar(adjMatrix);
    const result = aStar.search(0, 0, 13, 13, new EuclideanDistance());
    t.true(result !== undefined, `expected search result not to be undefined`);
    t.true(result !== null, `expected search result not to be null`);
    t.true(Array.isArray(result.solution), `expected ${result.solution} to be an array`);
    t.true(Array.isArray(result.visited), `expected ${result.visited} to be an array`);

    t.pass();
});
