const {is} = require('css-select');
const {Parser} = require('cssparser');

exports.type = 'full'
exports.active = true
exports.description = 'make '
exports.name = 'insertStyle' // Name isn't standard but we need it because our is local


exports.fn = function(data) {
  const svg = data.content[0]

  if (svg.isElem('svg') && svg.content) {
    // only one <style> is expected, in the first level
    const style = svg.content.find(child => child.isElem('style'))

    // no need to do work unless <style> exist
    if (style) {
      const parser = new Parser()
      const css = parser.parse(style.content[0].text)
      if (css.rulelist && Array.isArray(css.rulelist)) {
        css.rulelist.forEach(rule => walk(svg, rule))

        // remove <style> tag now
        const index = svg.content.indexOf(style)
        if (index !== -1) {
          svg.spliceContent(svg.content.indexOf(style), 1)
        }
      }
    }
  }

  return data
}

const proxied = {}

function proxy(elem) {
  if (elem.proxied === proxied) {
    return elem
  }
  return Object.assign({
    proxied,
    get type() {
      if (elem.isElem('script')) {
        return 'script'
      } else if (elem.isElem('style')) {
        return 'style'
      } else {
        return 'tag'
      }
    },
    get name() {
      return elem.elem
    },
    get data() {
      return elem.text
    },
    get parent() {
      return elem.parentNode ? proxy(elem.parentNode) : undefined
    },
    get attribs() {
      const attribs = {}
      for (let key in elem.attrs) {
        attribs[key] = elem.computedAttr(key)
      }
      return attribs
    },
    get children() {
      return elem.isEmpty() ? [] : elem.content.map(proxy)
    },
  }, elem)
}

function walk(parent, rule) {
  parent.content.forEach(elem => {
    if (is(proxy(elem), rule.selector)) {
      const style = elem.hasAttr('style') ? elem.attr('style').value.split(';') : []
      for (let key in rule.declarations) {
        style.push(`${key}: ${rule.declarations[key]};`)
      }
      elem.addAttr({
        name: 'style',
        local: 'style',
        value: style.join(' '),
        prefix: ''
      })
    }
    if (!elem.isEmpty()) {
      walk(elem, rule)
    }
  })
}
