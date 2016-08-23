const assert = require('assert');

function arcToCurve(data) {
  let points = arcToCurveEstimation(data);
  let result = [];
  for(var i = 0; i < points.length; i += 6) {
    result.push({
      controlPoint1: { x: points[i], y: points[i+1] },
      controlPoint2: { x: points[i+2], y: points[i+3] },
      endPoint: { x: points[i+4], y: points[i+5] }
    });
  }
  return result;
}

function arcToCurveEstimation(data) {
  let {x1, y1, rx, ry, angle, largeArcFlag, sweepFlag, x2, y2, recursive} = data;
  assert(typeof x1 == 'number', 'x1 must be a number');
  assert(typeof y1 == 'number', 'y1 must be a number');
  assert(typeof rx == 'number', 'rx must be a number');
  assert(typeof ry == 'number', 'ry must be a number');
  assert(typeof x2 == 'number', 'x2 must be a number');
  assert(typeof y2 == 'number', 'y2 must be a number');
  // Implementation based on https://github.com/DmitryBaranovskiy/raphael/blob/master/raphael.js
  let math = Math, PI = Math.PI;
  var _120 = PI * 120 / 180,
  rad = PI / 180 * (+angle || 0),
  res = [],
  xy,
  rotate = function (x, y, rad) {
    var X = x * math.cos(rad) - y * math.sin(rad),
    Y = x * math.sin(rad) + y * math.cos(rad);
    return {x: X, y: Y};
  };
  if (!recursive) {
    xy = rotate(x1, y1, -rad);
    x1 = xy.x;
    y1 = xy.y;
    xy = rotate(x2, y2, -rad);
    x2 = xy.x;
    y2 = xy.y;
   var x = (x1 - x2) / 2,
    y = (y1 - y2) / 2;
    var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
    if (h > 1) {
      h = math.sqrt(h);
      rx = h * rx;
      ry = h * ry;
    }
    var rx2 = rx * rx,
    ry2 = ry * ry,
    k = (largeArcFlag == sweepFlag ? -1 : 1) *
    math.sqrt(math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
    cx = k * rx * y / ry + (x1 + x2) / 2,
    cy = k * -ry * x / rx + (y1 + y2) / 2,
    f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
    f2 = math.asin(((y2 - cy) / ry).toFixed(9));

    f1 = x1 < cx ? PI - f1 : f1;
    f2 = x2 < cx ? PI - f2 : f2;
    f1 < 0 && (f1 = PI * 2 + f1);
    f2 < 0 && (f2 = PI * 2 + f2);
    if (sweepFlag && f1 > f2) {
      f1 = f1 - PI * 2;
    }
    if (!sweepFlag && f2 > f1) {
      f2 = f2 - PI * 2;
    }
  } else {
    f1 = recursive[0];
    f2 = recursive[1];
    cx = recursive[2];
    cy = recursive[3];
  }
  var df = f2 - f1;
  if (Math.abs(df) > _120) {
    var f2old = f2,
    x2old = x2,
    y2old = y2;
    f2 = f1 + _120 * (sweepFlag && f2 > f1 ? 1 : -1);
    x2 = cx + rx * math.cos(f2);
    y2 = cy + ry * math.sin(f2);
    res = arcToCurveEstimation({x1: x2, y1: y2, rx: rx, ry: ry,
      angle: angle, largeArcFlag: 0, sweepFlag: sweepFlag, x2: x2old, y2: y2old,
      recursive: [f2, f2old, cx, cy]});
  }
  df = f2 - f1;
  var c1 = math.cos(f1),
  s1 = math.sin(f1),
  c2 = math.cos(f2),
  s2 = math.sin(f2),
  t = math.tan(df / 4),
  hx = 4 / 3 * rx * t,
  hy = 4 / 3 * ry * t,
  m1 = [x1, y1],
  m2 = [x1 + hx * s1, y1 - hy * c1],
  m3 = [x2 + hx * s2, y2 - hy * c2],
  m4 = [x2, y2];
  m2[0] = 2 * m1[0] - m2[0];
  m2[1] = 2 * m1[1] - m2[1];
  if (recursive) {
    return [m2, m3, m4].concat(res);
  } else {
    res = [m2, m3, m4].concat(res).join().split(',');
    var newres = [];
    for (var i = 0, ii = res.length; i < ii; i++) {
      newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
    }
    return newres;
  }
}

module.exports = arcToCurve;
