const assert = require('assert')

const optimizeSvg = require('./tools/optimize-svg')
const {parseXmlString, buildElementTree, Element} = require('./tools/parse-xml-string')

const extension = '.pug'

function convert (inputXml, options = {}) {
  const codeIndent = options.codeIndent

  assert(typeof inputXml === 'string', 'inputXml must be a string')
  assert(typeof codeIndent === 'string', 'codeIndent must be a string')
  assert(/^\s*$/.test(codeIndent), 'codeIndent must be whitespace only')

  return optimizeSvg(inputXml)
    .then(xml => parseXmlString(xml))
    .then(doc => compile(doc))

  function compile (doc) {
    const root = new Element('svg')
    buildElementTree(root, doc.svg)
    return render(root)
  }

  // render the Elemen tree into a jade string
  function render (element, indent = '') {
    // ex g#group-1.red.thick(transform='123123')
    let output = indent
    output += element.nodeName

    const attrs = []
    for (let k in element.attributes) {
      if (k === 'id') {
        output += '#' + element.attributes[k]
      } else if (k === 'class') {
        output += element.attributes[k].split(' ').join('.')
      } else {
        attrs.push(`${k}='${element.attributes[k]}'`)
      }
    }
    output += attrs.length ? `(${attrs.join(', ')})` : ''

    if (element.content) {
      output += ' ' + element.content + '\n'
    } else {
      output += '\n'
      output += element.children.map(child => render(child, indent + codeIndent)).join('')
    }
    return output
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
