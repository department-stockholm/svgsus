
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
        console.log('found style', css.rulelist)
        css.rulelist.forEach(rule => walk(svg, rule))
      }
    }
  }

  return data
}

function walk(parent, rule, ancestors=[]) {
  parent.content.forEach(elem => {
    if (match(rule.selector, elem, ancestors)) {
      let style = elem.hasAttr('style') ? elem.attr('style').value.split(';') : []
      for (let key in rule.declarations) {
        style.push(`${key}: ${rule.declarations[key]}`)
      }
      console.log('adding style', style)
      elem.addAttr({
        name: 'style',
        value: style
      })

    } else if (!elem.isEmpty()) {
      walk(elem, rule, ancestors.concat([parent]))
    }
  })
}

function match(selector, elem) {
  // console.log('match', selector, ancestors, elem)

  // simple match, class of element matches simple class selector
  if (elem.hasAttr('class') && matchClass(selector, elem.attr('class').value)) {
    return true
  }

  return false
}

function matchClass(selector, className) {
  return className.split(/\s+/).some(cls => cls === selector.slice(1))
}