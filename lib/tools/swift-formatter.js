const svgColor = require('./svg-color')
const assert = require('assert')

const lookup = {
  v3: {
    AppKit: {
      move: 'move(to: ',
      curve: 'curve(to: ',
      line: 'line(to: ',
      close: 'close()',
      cgPath: 'CGPath',
      cgColor: 'cgColor'
    },
    UIKit: {
      move: 'move(to: ',
      curve: 'addCurve(to: ',
      line: 'addLine(to: ',
      close: 'close()',
      cgPath: 'cgPath',
      cgColor: 'cgColor'
    }
  },
  v2: {
    AppKit: {
      move: 'moveToPoint(',
      curve: 'curveToPoint(',
      line: 'lineToPoint(',
      close: 'closePath()',
      cgPath: 'CGPath',
      cgColor: 'CGColor'
    },
    UIKit: {
      move: 'moveToPoint(',
      curve: 'addCurveToPoint(',
      line: 'addLineToPoint(',
      close: 'closePath()',
      cgPath: 'CGPath',
      cgColor: 'CGColor'
    }
  }
}

class SwiftFormatter {
  constructor ({framework, version = 2} = {}) {
    assert(['AppKit', 'UIKit'].indexOf(framework) !== -1, 'framework must be either "AppKit" or "UIKit"')
    assert([3, 2].indexOf(version) !== -1, 'version must be either "3" or "2"')
    this.framework = framework
    this.version = version
    this.bezierType = framework === 'AppKit' ? 'NSBezierPath' : 'UIBezierPath'
    this.pointType = framework === 'AppKit' ? 'NSPoint' : 'CGPoint'
    this.table = lookup[`v${version}`][framework]
  }
  initPath () {
    return `${this.bezierType}()`
  }
  initPoint ({x, y}) {
    return `${this.pointType}(x: ${x}, y: ${y})`
  }
  initShape () {
    return 'CAShapeLayer()'
  }
  initRect ({x, y, width, height}) {
    return `CGRect(x: ${x}, y: ${y}, width: ${width}, height: ${height})`
  }
  move ({point}) {
    return `${this.table.move}${point})`
  }
  curve ({point, cPoint1, cPoint2}) {
    return `${this.table.curve}${point}, controlPoint1: ${cPoint1}, controlPoint2: ${cPoint2})`
  }
  line ({point}) {
    return `${this.table.line}${point})`
  }
  closePath () {
    return `${this.table.close}`
  }
  scale3d ({x, y, z}) {
    return `CATransform3DMakeScale(${x}, ${y}, ${z})`
  }
  translate3d ({x, y, z}) {
    return `CATransform3DMakeTranslation(${x}, ${y}, ${z})`
  }
  concat3d (transform1, transform2) {
    return `CATransform3DConcat(${transform1}, ${transform2})`
  }
  addLayer (layer) {
    return `addSublayer(${layer})`
  }
  toCGColor ({text, alpha}) {
    var color = svgColor(text)
    if (!color.none()) {
      color.alpha(alpha)
    }
    var kitColor = this.framework === 'AppKit' ? color.nscolor() : color.uicolor()
    return `${kitColor}.${this.cgColor}`
  }
  get cgPath () {
    return this.table.cgPath
  }
  get cgColor () {
    return this.table.cgColor
  }
  get fillColor () {
    return 'fillColor'
  }
  get strokeColor () {
    return 'strokeColor'
  }
  get lineWidth () {
    return 'lineWidth'
  }
  get lineJoin () {
    return 'lineJoin'
  }
  get lineCap () {
    return 'lineCap'
  }
  get miterLimit () {
    return 'miterLimit'
  }
  get fillRule () {
    return 'fillRule'
  }
}

exports.SwiftFormatter = SwiftFormatter
