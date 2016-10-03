const assert = require('assert')

const optimizeSvg = require('./tools/optimize-svg')
const extension = '.svg'

function convert (inputXml, options = {}) {
  const codeIndent = options.codeIndent
  const compressed = options.compressed
  assert(typeof codeIndent === 'string', 'codeIndent must be a string')
  assert(typeof compressed === 'boolean', 'compressed must be a boolean')
  assert(/^\s*$/.test(codeIndent), 'codeIndent must be whitespace only')

  return optimizeSvg(inputXml, {
    noArcs: true,
    js2svg: {
      indent: codeIndent,
      pretty: !compressed
    }
  })
};

function convertAll (contents, options = {}) {
  return Promise.all(contents.map(content => convert(content.svg, options)
      .then(code => ({ name: `${content.name}${extension}`, code })
    )))
}

exports.extension = extension
exports.convert = convert
exports.convertAll = convertAll
