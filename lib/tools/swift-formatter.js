const svgColor = require('./svg-color')

class Swift2Formatter {
  constructor ({framework}) {
    this.framework = framework
    this.bezierType = framework === 'AppKit' ? 'NSBezierPath' : 'UIBezierPath'
    this.pointType = framework === 'AppKit' ? 'NSPoint' : 'CGPoint'
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
    return `moveToPoint(${point})`
  }
  curve ({point, cPoint1, cPoint2}) {
    const fName = this.framework === 'UIKit' ? 'addCurveToPoint' : 'curveToPoint'
    return `${fName}(${point}, controlPoint1: ${cPoint1}, controlPoint2: ${cPoint2})`
  }
  line ({point}) {
    const fName = this.framework === 'UIKit' ? 'addLineToPoint' : 'lineToPoint'
    return `${fName}(${point})`
  }
  closePath () {
    return 'closePath()'
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
    return 'CGPath'
  }
  get cgColor () {
    return 'CGColor'
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

exports.Swift2Formatter = Swift2Formatter
