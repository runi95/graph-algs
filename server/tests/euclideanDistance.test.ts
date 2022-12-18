import test from 'ava';
import {Point2D} from '../src/algorithms/point2d';
import {Point3D} from '../src/algorithms/point3d';
import {EuclideanDistance} from '../src/heuristics/euclideanDistance';

test('should give correct 2D distances', t => {
    const heuristics2D = new EuclideanDistance<Point2D>();

    // Simple calculations
    t.snapshot(heuristics2D.calculate(new Point2D(10, 10), new Point2D(10, 10)));
    t.snapshot(heuristics2D.calculate(new Point2D(11, 10), new Point2D(10, 10)));
    t.snapshot(heuristics2D.calculate(new Point2D(10, 11), new Point2D(10, 10)));
    t.snapshot(heuristics2D.calculate(new Point2D(10, 10), new Point2D(11, 10)));
    t.snapshot(heuristics2D.calculate(new Point2D(10, 10), new Point2D(10, 11)));
    t.snapshot(heuristics2D.calculate(new Point2D(9, 10), new Point2D(10, 10)));
    t.snapshot(heuristics2D.calculate(new Point2D(10, 9), new Point2D(10, 10)));
    t.snapshot(heuristics2D.calculate(new Point2D(10, 10), new Point2D(9, 10)));
    t.snapshot(heuristics2D.calculate(new Point2D(10, 10), new Point2D(10, 9)));
    t.snapshot(heuristics2D.calculate(new Point2D(12, 10), new Point2D(10, 10)));

    // Advanced calculations
    t.snapshot(heuristics2D.calculate(new Point2D(11, 11), new Point2D(10, 10)));
    t.snapshot(heuristics2D.calculate(new Point2D(10, 10), new Point2D(11, 11)));
    t.snapshot(heuristics2D.calculate(new Point2D(5, 46), new Point2D(53, 34)));
    t.snapshot(heuristics2D.calculate(new Point2D(37, 57), new Point2D(40, 31)));
    t.snapshot(heuristics2D.calculate(new Point2D(38, 83), new Point2D(62, 83)));
    t.snapshot(heuristics2D.calculate(new Point2D(51, 70), new Point2D(95, 36)));
    t.snapshot(heuristics2D.calculate(new Point2D(97, 25), new Point2D(48, 83)));
    t.snapshot(heuristics2D.calculate(new Point2D(47, 46), new Point2D(89, 77)));
});

test('should give correct 3D distances', t => {
    const heuristics3D = new EuclideanDistance<Point3D>();

    // Simple calculations
    t.snapshot(heuristics3D.calculate(new Point3D(10, 10, 10), new Point3D(10, 10, 10)));
    t.snapshot(heuristics3D.calculate(new Point3D(11, 10, 10), new Point3D(10, 10, 10)));
    t.snapshot(heuristics3D.calculate(new Point3D(10, 11, 10), new Point3D(10, 10, 10)));
    t.snapshot(heuristics3D.calculate(new Point3D(10, 10, 11), new Point3D(10, 10, 10)));
    t.snapshot(heuristics3D.calculate(new Point3D(10, 10, 10), new Point3D(11, 10, 10)));
    t.snapshot(heuristics3D.calculate(new Point3D(10, 10, 10), new Point3D(10, 11, 10)));
    t.snapshot(heuristics3D.calculate(new Point3D(10, 10, 10), new Point3D(10, 10, 11)));
    t.snapshot(heuristics3D.calculate(new Point3D(9, 10, 10), new Point3D(10, 10, 10)));
    t.snapshot(heuristics3D.calculate(new Point3D(10, 9, 10), new Point3D(10, 10, 10)));
    t.snapshot(heuristics3D.calculate(new Point3D(10, 10, 9), new Point3D(10, 10, 10)));
    t.snapshot(heuristics3D.calculate(new Point3D(10, 10, 10), new Point3D(9, 10, 10)));
    t.snapshot(heuristics3D.calculate(new Point3D(10, 10, 10), new Point3D(10, 9, 10)));
    t.snapshot(heuristics3D.calculate(new Point3D(10, 10, 10), new Point3D(10, 10, 9)));
    t.snapshot(heuristics3D.calculate(new Point3D(12, 10, 10), new Point3D(10, 10, 10)));

    // Advanced calculations
    t.snapshot(heuristics3D.calculate(new Point3D(11, 11, 11), new Point3D(10, 10, 10)));
    t.snapshot(heuristics3D.calculate(new Point3D(10, 10, 10), new Point3D(11, 11, 11)));
    t.snapshot(heuristics3D.calculate(new Point3D(5, 46, 26), new Point3D(53, 34, 69)));
    t.snapshot(heuristics3D.calculate(new Point3D(37, 57, 96), new Point3D(40, 31, 20)));
    t.snapshot(heuristics3D.calculate(new Point3D(38, 83, 54), new Point3D(62, 83, 36)));
    t.snapshot(heuristics3D.calculate(new Point3D(51, 70, 74), new Point3D(95, 36, 100)));
    t.snapshot(heuristics3D.calculate(new Point3D(97, 25, 12), new Point3D(48, 83, 16)));
    t.snapshot(heuristics3D.calculate(new Point3D(47, 46, 90), new Point3D(89, 77, 39)));
});
