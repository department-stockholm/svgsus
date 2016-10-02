const assert = require('assert')
const ShapeConverter = require('./tools/shape-converter')
const {getDimensions, removeNonNumeric} = require('./tools/svg-dimens')
const StringBuilder = require('./tools/string-builder')
const svgColor = require('./tools/svg-color')
const optimizeSvg = require('./tools/optimize-svg')
const substituteDefs = require('./plugins/substitute-defs')
const parseXmlString = require('./tools/parse-xml-string')
const extension = '.xml'

function convert (inputXml, options = {}) {
  const codeIndent = options.codeIndent
  assert(typeof codeIndent === 'string', 'codeIndent must be a string')
  assert(/^\s*$/.test(codeIndent), 'codeIndent must be whitespace only')

  return optimizeSvg(inputXml, {noArcs: true, custom: [substituteDefs]})
    .then(outputXml => parseXmlString(outputXml))
    .then(outputXml => generateCode(outputXml))

  function generateCode (xml) {
    var generatedOutput = ''
    var svg = xml.svg
    var dimensions = getDimensions(svg)
    var width = dimensions.width
    var height = dimensions.height
    var baseStyle = svg.$

      // XML Vector start
    generatedOutput = new StringBuilder()
    generatedOutput.append('<?xml version="1.0" encoding="utf-8"?>\n')
    generatedOutput.append('<vector xmlns:android="http://schemas.android.com/apk/res/android"')
    generatedOutput.append('\n' + codeIndent + `android:width="${width}dp"`)
    generatedOutput.append('\n' + codeIndent + `android:height="${height}dp"`)
    generatedOutput.append('\n' + codeIndent + `android:viewportWidth="${width}"`)
    generatedOutput.append('\n' + codeIndent + `android:viewportHeight="${height}"`)
    generatedOutput.append('>\n\n')

    recursiveTreeWalk(svg, baseStyle, 0, generatedOutput)

    generatedOutput.append('</vector>')

    return generatedOutput.toString()
  }

  function recursiveTreeWalk (parent, baseStyle, groupLevel, generatedOutput) {
    var isArray = Array.isArray(parent)

    for (var key in parent) {
      var current = parent[key]
      if (isArray) {
        for (var arrayKey in current) {
          var innerArray = current[arrayKey]
          innerArray.forEach(function (item) {
            recursiveTreeWalkItem(arrayKey, item, baseStyle, groupLevel, generatedOutput)
          })
        }
      } else {
        if (Array.isArray(current)) {
          current.forEach(function (item) {
            recursiveTreeWalkItem(key, item, baseStyle, groupLevel, generatedOutput)
          })
        } else {
          recursiveTreeWalkItem(key, current, baseStyle, groupLevel, generatedOutput)
        }
      }
    }
  }

  function recursiveTreeWalkItem (key, current, baseStyle, groupLevel, generatedOutput) {
    if (key === 'g' && Object.keys.length > 0) {
      var group = parseGroup(current)
      var groupIsValid = group.isSet // TODO Add this to user preferences, or force?
      if (groupIsValid) printGroupStart(group, groupLevel, generatedOutput)
      if (groupIsValid) groupLevel++
      recursiveTreeWalk(current, appendGroupStyles(current.$, baseStyle), groupLevel, generatedOutput)
      if (groupIsValid) groupLevel--
      if (groupIsValid) printGroupEnd(group, generatedOutput)
    } else if (key === 'path') {
      var pathD = parsePathD(current)
      if (pathD != null) {
        printPath(pathD, [current.$, baseStyle], groupLevel, generatedOutput)
      } else {
        console.warn('found path(s) without data (empty or invalid parameter <i>d</i>)')
      }
    } else if (key === 'line') {
      printPath(ShapeConverter.convertLine(current.$), [current.$, baseStyle], groupLevel, generatedOutput)
    } else if (key === 'rect') {
      printPath(ShapeConverter.convertRect(current.$), [current.$, baseStyle], groupLevel, generatedOutput)
    } else if (key === 'circle') {
      printPath(ShapeConverter.convertCircle(current.$), [current.$, baseStyle], groupLevel, generatedOutput)
    } else if (key === 'ellipse') {
      printPath(ShapeConverter.convertEllipse(current.$), [current.$, baseStyle], groupLevel, generatedOutput)
    } else if (key === 'polyline') {
      printPath(ShapeConverter.convertPolygon(current.$, true), [current.$, baseStyle], groupLevel, generatedOutput)
    } else if (key === 'polygon') {
      printPath(ShapeConverter.convertPolygon(current.$, false), [current.$, baseStyle], groupLevel, generatedOutput)
    } else if (key === 'text') {
      console.warn('<i>text</i> element is not supported, export all text into path')
    }
  }

  function appendGroupStyles (groupStyle, baseStyle) {
    let styles = {}
    for (let styleName in groupStyle) {
      styles[styleName] = groupStyle[styleName]
    }
    for (let styleName in baseStyle) {
      if (typeof styles[styleName] === 'undefined') {
        styles[styleName] = baseStyle[styleName]
      }
    }
    return styles
  }

  function parseGroup (groupTag) {
    var transform = groupTag.$ ? groupTag.$.transform : undefined
    var id = groupTag.$ ? groupTag.$.id : undefined
    var groupTransform = {transformX: 0, transformY: 0, scaleX: 1, scaleY: 1, rotate: 0, rotatePivotX: -1, rotatePivotY: -1, id: '', isSet: false}
    if (typeof transform !== 'undefined') {
      var regex = /((\w|\s)+)\(([^)]+)/mg
      var result
      while ((result = regex.exec(transform))) {
        var split = result[3].split(/[,\s]+/)
        var transformName = result[1].trim()
        if (transformName === 'translate') {
          groupTransform.transformX = split[0]
          groupTransform.transformY = split[1] || 0
          groupTransform.isSet = true
        } else if (transformName === 'scale') {
          groupTransform.scaleX = split[0]
          groupTransform.scaleY = split[1] || 0
          groupTransform.isSet = true
        } else if (transformName === 'rotate') {
          groupTransform.rotate = split[0]
          groupTransform.rotatePivotX = split[1] || -1
          groupTransform.rotatePivotY = split[2] || -1
          groupTransform.isSet = true
        } else {
          console.error('group transform \'<i>' + transformName + '</i>\' is not supported, use option <i>Bake transforms into path</i>')
        }
      }
    }
    if (typeof id !== 'undefined') {
      groupTransform.id = id
    }

    return groupTransform
  }

  function parsePathD (pathData) {
    const DRAW_LINE = 'l' // used as default parameter when no found in path
    const START_PATH = 'M'
    const END_PATH = 'Z'

    var path = pathData.$ ? pathData.$.d : undefined

    if (typeof path === 'undefined') {
      return null
    }

    path = path.replace(/\s{2,}/g, ' ') // replace extra spaces

    if (path.match(/-?\d*\.?\d+e[+-]?\d+/g)) {
      console.warn('found some numbers with scientific E notation in pathData which Android probably does not support. ' +
          'Please fix It manually by editing your editor precision or manually by editing pathData')
    }

      // Check path If contains draw otherwise use default l
    var pathStart = false
    var bigM = false
    var skipMove = false
    var stop = false
    var pathRebuild = ''
    path.split(' ').forEach(function (t) {
      if (stop) {
        pathRebuild += t + ' '
        return
      }

      if (t.toUpperCase() === START_PATH) {
        pathStart = true
        bigM = t === START_PATH
      } else if (skipMove && pathStart) {
        if (!(t.indexOf(',') === -1 && isNaN(t))) {
          t = (bigM ? DRAW_LINE.toUpperCase() : DRAW_LINE) + ' ' + t
        }
        stop = true
      } else if (pathStart) {
        skipMove = true
      }

      pathRebuild += t + ' '
    })

    pathRebuild // TODO why is this built? (used here to please eslint)
    path = path.replace(/^\s*m/, START_PATH).replace(/^\s*z/, END_PATH) // Fix path positioning
    path = path.replace(/(\.\d+)(\.\d+)\s?/g, '$1 $2 ') // Fix path formatting

    if (!path.endsWith(' ')) {
      path += ' '
    }
    return path
      // return wordwrap(path.trim(), 80, "\n")
  }

  function printGroupStart (groupTransform, groupLevel, generatedOutput) {
    generatedOutput.append(codeIndent.repeat(groupLevel + 1) + '<group')
    generatedOutput.append(generateAttr('translateX', groupTransform.transformX, groupLevel + 1, 0))
    generatedOutput.append(generateAttr('translateY', groupTransform.transformY, groupLevel + 1, 0))
    generatedOutput.append(generateAttr('scaleX', groupTransform.scaleX, groupLevel + 1, 1))
    generatedOutput.append(generateAttr('scaleY', groupTransform.scaleY, groupLevel + 1, 1))
    generatedOutput.append('>\n')
  }

  function printGroupEnd (groupLevel, generatedOutput) {
    generatedOutput.append(codeIndent.repeat(groupLevel + 1) + '</group>\n')
  }

  function printPath (pathData, stylesArray, groupLevel, generatedOutput) {
    var styles = stylesArray[0]
    var parentGroupStyles = stylesArray[1]

    if (pathData === null) {
      return
    }

    if (styles.hasOwnProperty('transform')) {
      console.warn('transforms on path are not supported, use option <i>Bake transforms into path</i>')
    }

    if (parentGroupStyles != null) {
          // Inherit styles from group first
      for (var styleName in parentGroupStyles) {
        if (typeof styles[styleName] === 'undefined') {
          styles[styleName] = parentGroupStyles[styleName]
        }
      }
    }
      // Parent opacity setting - multiply fill-opacity and stroke-opacity
    var opacity = styles['opacity']
    if (typeof opacity !== 'undefined') {
      if (typeof styles['fill-opacity'] !== 'undefined') {
        styles['fill-opacity'] *= opacity
      } else {
        styles['fill-opacity'] = opacity
      }
      if (typeof styles['stroke-opacity'] !== 'undefined') {
        styles['stroke-opacity'] *= opacity
      } else {
        styles['stroke-opacity'] = opacity
      }
    }

      // If fill is omitted use default black
    if (typeof styles['fill'] === 'undefined') {
      styles['fill'] = '#000000'
    }

    generatedOutput.append(codeIndent.repeat(groupLevel + 1) + '<path')
    generatedOutput.append(generateAttr('fillColor', svgColor(styles['fill']).hex(), groupLevel, 'none'))
    generatedOutput.append(generateAttr('fillAlpha', styles['fill-opacity'], groupLevel, '1'))
    generatedOutput.append(generateAttr('strokeColor', svgColor(styles['stroke']).hex(), groupLevel, 'none'))
    generatedOutput.append(generateAttr('strokeAlpha', styles['stroke-opacity'], groupLevel, '1'))
    generatedOutput.append(generateAttr('strokeWidth', removeNonNumeric(styles['stroke-width']), groupLevel, '0'))
    generatedOutput.append(generateAttr('strokeLineJoin', styles['stroke-linejoin'], groupLevel, 'miter'))
    generatedOutput.append(generateAttr('strokeMiterLimit', styles['stroke-miterlimit'], groupLevel, '4'))
    generatedOutput.append(generateAttr('strokeLineCap', styles['stroke-linecap'], groupLevel, 'butt'))
    generatedOutput.append(generateAttr('pathData', pathData, groupLevel, null, true))
    generatedOutput.append('\n')
  }

  function generateAttr (name, val, groupLevel, def, end) {
    if (typeof val === 'undefined' || val === def) return ''
    var result = '\n' + codeIndent.repeat(groupLevel + 2) + 'android:' + name + '="' + val + '"'
    if (end) {
      result += ' />'
    }
    return result
  }
}

function convertAll (contents, options = {}) {
  const codeIndent = options.codeIndent
  assert(typeof codeIndent === 'string', 'codeIndent must be a string')
  assert(/^\s*$/.test(codeIndent), 'codeIndent must be whitespace only')

  return Promise.all(contents.map(content => convert(content.svg, options)
      .then(code => ({ name: `${content.name}${extension}`, code })
    )))
}

exports.extension = extension
exports.convertAll = convertAll
exports.convert = convert
