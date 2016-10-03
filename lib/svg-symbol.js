const assert = require('assert')

const removeInvisiblePaintElems = require('./plugins/remove-invisible-paint-elems')
const moveGroupPaintToElems = require('./plugins/move-group-paint-to-elems')
const substituteDefs = require('./plugins/substitute-defs')
const removePaintAttrs = require('./plugins/remove-paint-attrs')
const preferViewBox = require('./plugins/prefer-viewbox')
const optimizeSvg = require('./tools/optimize-svg')

const extension = '.svg'

function convert (inputXml, options = {}) {
  const codeIndent = options.codeIndent
  const name = options.name || 'svgsus-symbol'
  const stripStyle = options.stripStyle === undefined ? true : options.stripStyle
  const compressed = options.compressed === undefined ? true : options.compressed

  assert(typeof codeIndent === 'string', 'codeIndent must be a string')
  assert(typeof name === 'string', 'name must be a string')
  assert(typeof stripStyle === 'boolean', 'stripStyle must be a boolean')
  assert(typeof compressed === 'boolean', 'compressed must be a boolean')
  assert(/^\s*$/.test(codeIndent), 'codeIndent must be whitespace only')

  return optimizeSvg(inputXml, {
    removeTitle: true,
    removeDimensions: true,
    removeXMLNS: true,
    js2svg: {
      indent: codeIndent,
      pretty: !compressed
    },
    custom: stripStyle
      ? [substituteDefs, moveGroupPaintToElems, removeInvisiblePaintElems, removePaintAttrs, preferViewBox]
      : [substituteDefs, preferViewBox]
  }).then(svg =>
    svg
      .replace('<svg', `<symbol id="${name}"`)
      .replace('</svg', '</symbol')
      .trim()
  )
}

function convertAll (contents, options = {}) {
  const compressed = options.compressed === undefined ? true : options.compressed
  assert(typeof compressed === 'boolean', 'compressed must be a boolean')

  function varName (str) {
    // logo.svgsus-large home.svg => logo-svgsus-large-home-svg
    const separators = [' ', '\\,', '\\.', '_']
    const arr = str.split(new RegExp(separators.join('|'), 'g'))
    return arr.join('-')
  }

  function joinContents (items) {
    var result = '<svg xmlns="http://www.w3.org/2000/svg">\n'
    result += items.join('\n')
    result += '\n</svg>\n'
    return result
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

  function appendName (name, options) {
    let result = {name: name}
    Object.keys(options).forEach(key => (result[key] = options[key]))
    return result
  }

  return Promise.all(contents.map(content =>
      convert(content.svg, appendName(varName(content.name), options))
    )).then(separated => ([{ name: fileName(), code: joinContents(separated) }]))
}

exports.extension = extension
exports.convert = convert
exports.convertAll = convertAll
