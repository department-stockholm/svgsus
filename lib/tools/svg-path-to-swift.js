const svgParse = require('svg-path-parser')
const arcToCurve = require('./arc-to-curve')

function uiBezierPathParser({pathData, pathName, codeIndent, layer, skipStart, skipEnd, formatter}) {
  var points = svgParse(pathData)
  var name = pathName || 'svgsusPath'

  let output = ''

  if(!skipStart) {
    output += `${codeIndent}let ${name} = ${formatter.initPath()}\n`
  }

  printPoints(points)

  if(!skipEnd) {
    output += `${codeIndent}${layer}.path = ${name}.${formatter.cgPath}\n`
  }

  function printPoints(points) {
    let actualPoint, previousItem, pointInCode
    let currentPointInPath = { x: 0, y: 0 }
    points.forEach(function(item) {
      actualPoint = absolutePoint(item, item, currentPointInPath);
      pointInCode = formatter.initPoint({x: actualPoint.x, y: actualPoint.y })
      switch(item.code) {
        case 'm':
        case 'M': {
          output += `${codeIndent}${name}.${formatter.move({point: pointInCode})}\n`
        }
        break;
        case 'c':
        case 'C': {
          const control1 = absolutePoint(item, { x: item.x1, y: item.y1 }, currentPointInPath);
          const control2 = absolutePoint(item, { x: item.x2, y: item.y2 }, currentPointInPath);
          const cPoint1 = formatter.initPoint(control1);
          const cPoint2 = formatter.initPoint(control2);
          output += `${codeIndent}${name}.${formatter.curve({point: pointInCode, cPoint1, cPoint2 })}\n`
        }
        break;
        case 's':
        case 'S': {
          const control2 = absolutePoint(item, { x: item.x2, y: item.y2 }, currentPointInPath);
          const control1 = smoothCurveStartPoint(previousItem, item, currentPointInPath);
          const cPoint1 = formatter.initPoint(control1);
          const cPoint2 = formatter.initPoint(control2);
          output += `${codeIndent}${name}.${formatter.curve({point: pointInCode, cPoint1, cPoint2 })}\n`
        }
        break;
        case 'l':
        case 'L': {
          output += `${codeIndent}${name}.${formatter.line({point: pointInCode})}\n`
        }
        break;
        case 'h':
        case 'H': {
          const x = item.relative ? currentPointInPath.x + item.x : item.x
          const y = currentPointInPath.y
          const point = formatter.initPoint({x, y})
          output += `${codeIndent}${name}.${formatter.line({point})}\n`
        }
        break;
        case 'v':
        case 'V': {
          const x = currentPointInPath.x
          const y = item.relative ? currentPointInPath.y + item.y : item.y
          const point = formatter.initPoint({x, y})
          output += `${codeIndent}${name}.${formatter.line({point})}\n`
        }
        break;
        case 'q':
        case 'Q': {
          const controlPoint = absolutePoint(item, { x: item.x1, y: item.y1 }, currentPointInPath)
          const control1 = quadCurveStartPointEstimated(currentPointInPath, controlPoint)
          const control2 = quadCurveEndPointEstimated(actualPoint, controlPoint)
          const cPoint1 = formatter.initPoint(control1)
          const cPoint2 = formatter.initPoint(control2)
          output += `${codeIndent}${name}.${formatter.curve({point: pointInCode, cPoint1, cPoint2 })}\n`
        }
        break;
        case 't':
        case 'T': {
          const controlPoint = smoothQuadCurveControlPoint(previousItem, item, currentPointInPath)
          const control1 = quadCurveStartPointEstimated(currentPointInPath, controlPoint)
          const control2 = quadCurveEndPointEstimated(actualPoint, controlPoint)
          const cPoint1 = formatter.initPoint(control1)
          const cPoint2 = formatter.initPoint(control2)
          output += `${codeIndent}${name}.${formatter.curve({point: pointInCode, cPoint1, cPoint2 })}\n`
        }
        break;
        case 'z':
        case 'Z': {
          output += `${codeIndent}${name}.${formatter.closePath()}\n`
        }
        break;
        case 'a':
        case 'A':  {
          const points = arcToCurve({
            x1: currentPointInPath.x,
            y1: currentPointInPath.y,
            rx: item.rx,
            ry: item.ry,
            angle: item.xAxisRotation,
            largeArcFlag: item.largeArc,
            sweepFlag: item.sweep,
            x2: actualPoint.x,
            y2: actualPoint.y
          });
          points.forEach(p => {
            var point = formatter.initPoint(p.endPoint)
            var cPoint1 = formatter.initPoint(p.controlPoint1)
            var cPoint2 = formatter.initPoint(p.controlPoint2)
            output += `${codeIndent}${name}.${formatter.curve({point, cPoint1, cPoint2 })}\n`
            actualPoint = { x: point.endPoint.x, y: point.endPoint.y }
          });
        }
        break;
        default:
        console.warn('unsupported path code', item.code)
        }
        previousItem = item
        currentPointInPath = actualPoint
      })
    }

    function absolutePoint(item, point, currentPointInPath) {
      if(item.relative) {
        return { x:  (point.x || 0) + currentPointInPath.x, y: (point.y || 0) + currentPointInPath.y }
      } else {
        return {
          x: !isNaN(point.x) ? point.x : isNaN(currentPointInPath.x) ? 0 : currentPointInPath.x,
          y: !isNaN(point.y) ? point.y : isNaN(currentPointInPath.y) ? 0 : currentPointInPath.y }
        }
      }

      function quadCurveStartPointEstimated(currentPoint, controlPoint) {
        var x = (controlPoint.x - currentPoint.x) * (2.0 / 3.0) +  currentPoint.x * 3
        var y = (controlPoint.y - currentPoint.y) * (2.0 / 3.0) + currentPoint.y * 3
        return { x: x, y: y };
      }

      function quadCurveEndPointEstimated(endPoint, controlPoint) {
        var x = (controlPoint.x - endPoint.x) * (2.0 / 3.0) +  endPoint.x * 3
        var y = (controlPoint.y - endPoint.y) * (2.0 / 3.0) +  endPoint.y * 3
        return { x: x, y: y }
      }

      function smoothQuadCurveControlPoint(previousItem, item, currentPointInPath) {
        var controlPoint = currentPointInPath
        var currentPoint = controlPoint

        switch(previousItem.code) {
          case 'Q':
          controlPoint = { x: (2.0 * currentPoint.x) - previousItem.x, y: (2.0 * currentPoint.y) - previousItem.y }
          break;
          case 'q':
          var oldCurrentPoint = {x: currentPoint.x - previousItem.x, y: currentPoint.y - previousItem.y}
          controlPoint = {x: (2.0 * currentPoint.x) - (previousItem.x1 + oldCurrentPoint.x), y: (2.0 * currentPoint.y) - (previousItem.y1 + oldCurrentPoint.y) }
          break
        }
        return controlPoint
      }

      function smoothCurveStartPoint(previousItem, item, currentPointInPath) {
        var control1X = currentPointInPath.x
        var control1Y = currentPointInPath.y
        switch(previousItem.code) {
          case 'C':
          control1X = (2.0 * currentPointInPath.x) - previousItem.x2
          control1Y = (2.0 * currentPointInPath.y) - previousItem.y2
          break
          case 'c':
          var oldCurrentPoint = { x: currentPointInPath.x - previousItem.x, y: currentPointInPath.y - previousItem.y }
          control1X = (2.0 * currentPointInPath.x) - (previousItem.x2 + oldCurrentPoint.x)
          control1Y = (2.0 * currentPointInPath.y) - (previousItem.y2 + oldCurrentPoint.y)
          break
          case 'S':
          control1X = (2.0 * currentPointInPath.x) - previousItem.x2
          control1Y = (2.0 * currentPointInPath.y) - previousItem.y2
          break
          case 's':
          var oldCurrentPoint = { x: currentPointInPath.x - previousItem.x, y: currentPointInPath.y - previousItem.y }
          control1X = (2.0 * currentPointInPath.x) - (previousItem.x2 + oldCurrentPoint.x)
          control1Y = (2.0 * currentPointInPath.y) - (previousItem.y2 + oldCurrentPoint.y)
          break
        }
        return { x: control1X, y: control1Y }
      }
      return output
    }

    module.exports = uiBezierPathParser
