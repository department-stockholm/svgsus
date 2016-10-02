const assert = require('assert')
const xmldoc = require('xmldoc')

const optimizeSvg = require('./tools/optimize-svg')
const extension = '.pug'

function convert (inputXml, options = {}) {
  const codeIndent = options.codeIndent

  assert(typeof inputXml === 'string', 'inputXml must be a string')
  assert(typeof codeIndent === 'string', 'codeIndent must be a string')
  assert(/^\s*$/.test(codeIndent), 'codeIndent must be whitespace only')

  return optimizeSvg(inputXml)
    .then(optimizedSvg => compile(optimizedSvg))

  function compile (xml) {
    let doc = new xmldoc.XmlDocument(xml)
    let result = parse(doc, 0)
    if (result) return Promise.resolve(result)
    return Promise.reject('Error while generation jade format from: ' + xml)
  }

  function parse (node, hier) {
    var attrs, child, cls, id, indent, k, ret, txt, v, _i, _len, _ref, _ref1
    if (hier == null) {
      hier = 0
    }
    ret = ''
    id = node.attr.id != null ? '#' + node.attr.id : ''
    cls = node.attr['class'] != null ? '.' + (node.attr['class'].split(' ').join('.')) : ''
    attrs = []
    _ref = node.attr
    for (k in _ref) {
      v = _ref[k]
      if (k === 'id' || k === 'class') {
        continue
      }
      attrs.push('' + k + '=\'' + v + '\'')
    }
    attrs = attrs.length ? '(' + (attrs.join(', ')) + ')' : ''
    indent = codeIndent.repeat(hier)
    txt = node.val.trim()
    if (txt) {
      txt = ' ' + txt.split('\n').map(function (v) {
        return v.trim()
      }).join('\n' + indent + '  | ')
    }
    ret += indent + node.name + id + cls + attrs + txt + '\n'
    if (node.children.length) {
      _ref1 = node.children
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        child = _ref1[_i]
        ret += parse(child, hier + 1)
      }
    }
    return ret
  }
}

function convertAll (contents, options = {}) {
  return Promise.all(
    contents.map(content =>
      convert(content.svg, options)
        .then(code => ({
          name: `${content.name}${extension}`,
          code
        }))
    )
  )
}

exports.extension = extension
exports.convert = convert
exports.convertAll = convertAll
