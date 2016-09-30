import test from 'ava';
import arcToCurve from '../../lib/tools/arc-to-curve';

test(t => {
  t.throws(() => arcToCurve({x1: '0', y1: 0, rx: 0, ry: 0, angle: 0, largeArcFlag: true, sweepFlag: true, x2: 0, y2: 0 }), /x1 must be a number/);
})

test(t => {
  t.throws(() => arcToCurve({x1: 0, y1: 0, rx: undefined, ry: 0, angle: 0, largeArcFlag: true, sweepFlag: true, x2: true, y2: 0 }), /rx must be a number/);
})

test(t => {
  t.throws(() => arcToCurve({x1: 0, y1: 0, rx: 0, ry: 0, angle: 0, largeArcFlag: true, sweepFlag: true, x2: true, y2: 0 }), /x2 must be a number/);
})
