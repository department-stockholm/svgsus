const assert = require('assert')

const optimizeSvg = require('./tools/optimize-svg')
const parseXmlString = require('./tools/parse-xml-string')

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
    build(root, doc.svg)
    return render(root)
  }

  // builds an Element tree from the weird xml2js tree
  function build (element, node) {
    if (typeof node !== 'object') {
      element.text(node)
    } else {
      for (let key in node) {
        let child = node[key]
        if (key === '$') {
          if (typeof child === 'object') {
            for (let k in child) {
              element.attr(k, child[k])
            }
          }
        } else if (key === '_') {
          element.text(child)
        } else if (Array.isArray(child)) {
          child.forEach(entry => {
            if (typeof entry === 'string') {
              const el = new Element(key)
              el.text(entry)
              element.append(el)
            } else {
              const el = new Element(key)
              build(el, entry)
              element.append(el)
            }
          })
        } else if (typeof child === 'object') {
          const el = new Element(key)
          build(el, child)
          element.append(el)
        } else {
          const el = new Element(key)
          el.text(child)
          element.append(el)
        }
      }
    }
    return element
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

class Element {
  constructor (nodeName) {
    this.nodeName = nodeName
    this.attributes = {}
    this.children = []
    this.content = null
  }

  text (str) {
    this.content = str
  }

  attr (name, value) {
    this.attributes[name] = value
  }

  append (element) {
    this.children.push(element)
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
