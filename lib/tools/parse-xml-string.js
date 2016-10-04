
const {parseString} = require('xml2js')

function parseXmlString (inputXml) {
  return new Promise(function (resolve, reject) {
    parseString(inputXml,
      { explicitArray: true },
      function (err, xml) {
        if (err) reject(err)
        else resolve(xml)
      })
  })
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

exports.parseXmlString = parseXmlString
exports.Element = Element
exports.buildElementTree = build
