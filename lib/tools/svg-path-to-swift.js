const svgParse = require('svg-path-parser');

const StringBuilder = require('./string-builder');
const arcToCurve = require('./arc-to-curve');

const CodeFormat = {
  pathConstructor: function(key) {
    switch(key) {
      case 'AppKit':
        return 'NSBezierPath()';
      case 'UIKit':
        default:
        return 'UIBezierPath()';
    }
  },
  point: function(key) {
    switch(key) {
      case 'AppKit':
        return 'NSPoint(x: {0}, y: {1})';
      case 'UIKit':
        default:
        return 'CGPoint(x: {0}, y: {1})';
    }
  },
  moveTo: function(key) {
    switch(key) {
      case 'AppKit':
        return '{0}.moveToPoint({1})\n';
      case 'UIKit':
        default:
        return '{0}.moveToPoint({1})\n';
    }
  },
  curveTo: function(key) {
    switch(key) {
      case 'AppKit':
        return '{0}.curveToPoint({1}, controlPoint1: {2}, controlPoint2: {3})\n';
      case 'UIKit':
        default:
        return '{0}.addCurveToPoint({1}, controlPoint1: {2}, controlPoint2: {3})\n';
    }
  },
  lineTo: function(key) {
    switch(key) {
      case 'AppKit':
        return '{0}.lineToPoint({1})\n';
      case 'UIKit':
        default:
        return '{0}.addLineToPoint({1})\n';
    }
  },
  closePath: function(key) {
    switch(key) {
      case 'AppKit':
        return '{0}.closePath()\n';
      case 'UIKit':
        default:
        return '{0}.closePath()\n';
    }
  }
}
function uiBezierPathParser(data) {
  var points = svgParse(data.pathData);
  var name = data.pathName || 'svgsusPath';
  var codeIndent = data.codeIndent;
  var layer = data.layer;
  var codeType = data.codeType;
  var skipStart = data.skipStart;
  var skipEnd = data.skipEnd;

  var generatedOutput = new StringBuilder();

  if(!skipStart) { printStart(); }

  printPoints(points);

  if(!skipEnd) { printEnd(); }


  function printStart() {
    generatedOutput.appendFormat(codeIndent + 'let {0} = {1}\n', name, CodeFormat.pathConstructor(codeType))
  }

  function printEnd() {
    generatedOutput.appendFormat(codeIndent + '{0}.path = {1}.CGPath\n', layer, name)
  }

  function printPoints(points) {
    var actualPoint, previousItem, pointInCode;
    var currentPointInPath = { x: 0, y: 0 };
    var previousItem;
    points.forEach(function(item) {
      actualPoint = absolutePoint(item, item, currentPointInPath);
      pointInCode = format(CodeFormat.point(codeType), actualPoint.x, actualPoint.y);
      switch(item.code) {
        case 'm':
        case 'M':
          generatedOutput.appendFormat(codeIndent + CodeFormat.moveTo(codeType), name, pointInCode);
          break;
        case 'c':
        case 'C':
          var control1 = absolutePoint(item, { x: item.x1, y: item.y1 }, currentPointInPath);
          var control2 = absolutePoint(item, { x: item.x2, y: item.y2 }, currentPointInPath);
          var control1Code = format(CodeFormat.point(codeType), control1.x, control1.y);
          var control2Code = format(CodeFormat.point(codeType), control2.x, control2.y);
          generatedOutput.appendFormat(codeIndent + CodeFormat.curveTo(codeType), name, pointInCode, control1Code, control2Code)
          break;
        case 's':
        case 'S':
          var control2 = absolutePoint(item, { x: item.x2, y: item.y2 }, currentPointInPath);
          var control1 = smoothCurveStartPoint(previousItem, item, currentPointInPath);
          var control1Code = format(CodeFormat.point(codeType), control1.x, control1.y);
          var control2Code = format(CodeFormat.point(codeType), control2.x, control2.y);
          generatedOutput.appendFormat(codeIndent + CodeFormat.curveTo(codeType), name, pointInCode, control1Code, control2Code)
          break;
        case 'l':
        case 'L':
          generatedOutput.appendFormat(codeIndent + CodeFormat.lineTo(codeType), name, pointInCode);
          break;
        case 'h':
        case 'H':
          var x = item.relative ? currentPointInPath.x + item.x : item.x;
          var y = currentPointInPath.y;
          generatedOutput.appendFormat(codeIndent + CodeFormat.lineTo(codeType), name, format(CodeFormat.point(codeType), x, y));
          break;
        case 'v':
        case 'V':
          var x = currentPointInPath.x;
          var y = item.relative ? currentPointInPath.y + item.y : item.y;
          generatedOutput.appendFormat(codeIndent + CodeFormat.lineTo(codeType), name, format(CodeFormat.point(codeType), x, y));
          break;
        case 'q':
        case 'Q':
          var controlPoint = absolutePoint(item, { x: item.x1, y: item.y1 }, currentPointInPath);
          var control1 = quadCurveStartPointEstimated(currentPointInPath, controlPoint);
          var control2 = quadCurveEndPointEstimated(actualPoint, controlPoint);
          var control1Code = format(CodeFormat.point(codeType), control1.x, control1.y);
          var control2Code = format(CodeFormat.point(codeType), control2.x, control2.y);
          generatedOutput.appendFormat(codeIndent + CodeFormat.curveTo(codeType), name, pointInCode, control1Code, control2Code);
          break;
        case 't':
        case 'T':
          var controlPoint = smoothQuadCurveControlPoint(previousItem, item, currentPointInPath);
          var control1 = quadCurveStartPointEstimated(currentPointInPath, controlPoint);
          var control2 = quadCurveEndPointEstimated(actualPoint, controlPoint);
          var control1Code = format(CodeFormat.point(codeType), control1.x, control1.y);
          var control2Code = format(CodeFormat.point(codeType), control2.x, control2.y);
          generatedOutput.appendFormat(codeIndent + CodeFormat.curveTo(codeType), name, pointInCode, control1Code, control2Code);
          break;
        case 'z':
        case 'Z':
          generatedOutput.appendFormat(codeIndent + CodeFormat.closePath(codeType), name);
          break;
        case 'a':
        case 'A':
          let points = arcToCurve({ x1: currentPointInPath.x, y1: currentPointInPath.y,
            rx: item.rx, ry: item.ry, angle: item.xAxisRotation, largeArcFlag: item.largeArc, sweepFlag: item.sweep, x2: actualPoint.x, y2: actualPoint.y });
          points.forEach(point => {
            let endPointCode = format(CodeFormat.point(codeType), point.endPoint.x, point.endPoint.y);
            let control1Code = format(CodeFormat.point(codeType), point.controlPoint1.x, point.controlPoint1.y);
            let control2Code = format(CodeFormat.point(codeType), point.controlPoint2.x, point.controlPoint2.y);
            generatedOutput.appendFormat(codeIndent + CodeFormat.curveTo(codeType), name, endPointCode, control1Code, control2Code);
            actualPoint = { x: point.endPoint.x, y: point.endPoint.y };
          });
          break;
        default:
          console.warn('unsupported path code', item.code);
      }
      previousItem = item;
      currentPointInPath = actualPoint;
    });
  }

  function absolutePoint(item, point, currentPointInPath) {
    if(item.relative) {
      return { x:  (point.x || 0) + currentPointInPath.x, y: (point.y || 0) + currentPointInPath.y };
    } else {
      return {
        x: !isNaN(point.x) ? point.x : isNaN(currentPointInPath.x) ? 0 : currentPointInPath.x,
        y: !isNaN(point.y) ? point.y : isNaN(currentPointInPath.y) ? 0 : currentPointInPath.y };
    }
  }

  function quadCurveStartPointEstimated(currentPoint, controlPoint) {
    // This function should only be used for AppKit, since it does not suppoer quadCurveTo(...)
    var x = (controlPoint.x - currentPoint.x) * (2.0 / 3.0) +  currentPoint.x * 3;
    var y = (controlPoint.y - currentPoint.y) * (2.0 / 3.0) + currentPoint.y * 3;
    return { x: x, y: y };
  }

  function quadCurveEndPointEstimated(endPoint, controlPoint) {
    // This function should only be used for AppKit, since it does not suppoer quadCurveTo(...)
    var x = (controlPoint.x - endPoint.x) * (2.0 / 3.0) +  endPoint.x * 3;
    var y = (controlPoint.y - endPoint.y) * (2.0 / 3.0) +  endPoint.y * 3;
    return { x: x, y: y };
  }

  function smoothQuadCurveControlPoint(previousItem, item, currentPointInPath) {
    var controlPoint = currentPointInPath;
    var currentPoint = controlPoint;

    switch(previousItem.code) {
      case 'Q':
        controlPoint = { x: (2.0 * currentPoint.x) - previousItem.x, y: (2.0 * currentPoint.y) - previousItem.y };
        break;
      case 'q':
        var oldCurrentPoint = {x: currentPoint.x - previousItem.x, y: currentPoint.y - previousItem.y};
        controlPoint = {x: (2.0 * currentPoint.x) - (previousItem.x1 + oldCurrentPoint.x), y: (2.0 * currentPoint.y) - (previousItem.y1 + oldCurrentPoint.y) };
        break;
    }
    return controlPoint;
  }

  function smoothCurveStartPoint(previousItem, item, currentPointInPath) {
    var control1X = currentPointInPath.x;
    var control1Y = currentPointInPath.y;
    switch(previousItem.code) {
      case 'C':
        control1X = (2.0 * currentPointInPath.x) - previousItem.x2;
        control1Y = (2.0 * currentPointInPath.y) - previousItem.y2;
      break;
      case 'c':
        var oldCurrentPoint = { x: currentPointInPath.x - previousItem.x, y: currentPointInPath.y - previousItem.y };
        control1X = (2.0 * currentPointInPath.x) - (previousItem.x2 + oldCurrentPoint.x);
        control1Y = (2.0 * currentPointInPath.y) - (previousItem.y2 + oldCurrentPoint.y);
      break;
      case 'S':
        control1X = (2.0 * currentPointInPath.x) - previousItem.x2;
        control1Y = (2.0 * currentPointInPath.y) - previousItem.y2;
      break;
      case 's':
        var oldCurrentPoint = { x: currentPointInPath.x - previousItem.x, y: currentPointInPath.y - previousItem.y };
        control1X = (2.0 * currentPointInPath.x) - (previousItem.x2 + oldCurrentPoint.x)
        control1Y = (2.0 * currentPointInPath.y) - (previousItem.y2 + oldCurrentPoint.y)
      break;
    }
    return { x: control1X, y: control1Y };
  }

  function format() {
    var p = /({?){([^}]+)}(}?)/g;
    var a = arguments, v = a[0], o = false;
    if (a.length == 2) {
      if (typeof a[1] == 'object' && a[1].constructor != String) {
        a = a[1];
        o = true;
      }
    }
    var s = v.split(p);
    var r = [];
    for (var i = 0; i < s.length; i += 4) {
      r.push(s[i]);
      if (s.length > i + 3) {
        if (s[i + 1] == '{' && s[i + 3] == '}') {
          r.push(s[i + 1], s[i + 2], s[i + 3]);;
        } else {
          r.push(s[i + 1], a[o ? s[i + 2] : parseInt(s[i + 2], 10) + 1], s[i + 3]);
        }
      }
    }
    return r.join('');
  }
  return generatedOutput.toString();
}

module.exports = uiBezierPathParser
