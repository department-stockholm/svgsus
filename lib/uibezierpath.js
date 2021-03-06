const assert = require('assert')

const svgPathToSwift = require('./tools/svg-path-to-swift')
const optimizeSvg = require('./tools/optimize-svg')
const removeInvisiblePaintElems = require('./plugins/remove-invisible-paint-elems')
const moveGroupPaintToElems = require('./plugins/move-group-paint-to-elems')
const removePaintAttrs = require('./plugins/remove-paint-attrs')
const substituteDefs = require('./plugins/substitute-defs')
const {parseXmlString} = require('./tools/parse-xml-string')
const autoIndent = require('./tools/auto-indent')
const {SwiftFormatter} = require('./tools/swift-formatter')
const extension = '.swift'

function convert (inputXml, {version, codeType} = {}) {
  assert(['AppKit', 'UIKit'].indexOf(codeType) !== -1, 'codeType must be either "AppKit" or "UIKit"')

  const formatter = new SwiftFormatter({version, framework: codeType})
  // We start of by include ref content in the svg, then remove all style attrs
  return optimizeSvg(inputXml, {
    noArcs: true,
    custom: [substituteDefs, moveGroupPaintToElems, removeInvisiblePaintElems, removePaintAttrs]
  })
    .then(outputXml => parseXmlString(outputXml))
    .then(outputXml => generateCode(outputXml, formatter))

  function generateCode (xml, formatter) {
    // Right now assuming the clean always leave at max one group for us to work with
    const paths = xml.svg.path || xml.svg.g[0].path
    const name = 'path'

    if (!paths) {
      return ''
    }

    let result = ''
    paths.forEach((path, i) => {
      let data = {
        pathData: path.$.d,
        pathName: name,
        codeIndent: '',
        codeType: codeType,
        skipStart: (i !== 0),
        skipEnd: true,
        formatter
      }
      result += svgPathToSwift(data)
    })
    return result
  }
}

function convertAll (contents, options = {}) {
  const codeIndent = options.codeIndent
  assert(typeof codeIndent === 'string', 'codeIndent must be a string')
  assert(/^\s*$/.test(codeIndent), 'codeIndent must be whitespace only')

  function varName (str) {
    // logo.svgsus-large home.svg => logoSvgsusLargeHomeSvg
    var arr = str.split(/[ ,.-]+/)
    for (var i = 0, l = arr.length; i < l; i++) {
      arr[i] = arr[i].substr(0, 1)[i === 0 ? 'toLowerCase' : 'toUpperCase']() +
                 (arr[i].length > 1 ? arr[i].substr(1).toLowerCase() : '')
    }
    return arr.join('')
  }

  function joinContents (items) {
    let results = ''
    items.forEach(item => {
      results += `var ${varName(item.name)}: UIBezierPath = {\n` +
        `${item.converted}\n` +
        `return path\n` +
        '}()\n\n'
    })
    return results
  }

  function fileName () {
    if (contents.length) {
      return [
        varName(contents[0].name),
        contents.length > 1 ? '+' + (contents.length - 1) : '',
        extension
      ].join('')
    } else {
      return 'svgsus' + extension
    }
  }

  return Promise.all(contents.map(content => convert(content.svg, options)
      .then(converted => ({ converted, name: content.name })
    )))
    .then(separated => ([{
      name: fileName(),
      code: autoIndent(extension, joinContents(separated), codeIndent)
    }]))
}

exports.extension = extension
exports.convert = convert
exports.convertAll = convertAll
