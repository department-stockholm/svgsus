exports.type = 'full'
exports.active = true
exports.description = 'replace referenced <defs> in <use>-tags'
exports.name = 'substituteDefs' // Name isn't standard but we need it because our is local


exports.fn = function(data) {
  const svg = data.content[0]

  if (svg.isElem('svg') && svg.content) {
    // only check the first level (that's standard, right?)
    // and only one <defs> is expected...
    const defs = svg.content.find(child => child.isElem('defs'))

    // no need to do work unless <defs> exist
    if (defs) {

      // build a lookup of defs by id
      const defsById = defs.content.reduce((byId, elem) => {
        if (elem.hasAttr('id')) {
          byId[elem.attr('id').value] = elem
        }
        return byId
      }, Object.create(null))
      const usedById = Object.create(null)

      // then traverse the svg to find any <use> elements linked to one of the
      // ids. then replace those elements with a clone of the defs
      walk(svg, defsById, usedById)

      // TODO maybe prune the <defs> from the used ones and remove <defs> if empty
    }
  }

  return data
}

function walk(parent, defsById, usedById) {
  parent.content.forEach((elem, i) => {
    if (elem.isElem('use')) {
      const href = elem.attr('href') || elem.attr('xlink:href')
      if (href) {
        const id = href.value.trim().split('#').pop()

        // replace the element (and copy over attributes, except the href)
        if (id && id in defsById) {
          usedById[id] = true
          const def = defsById[id].clone()
          elem.eachAttr(attr => attr === href || def.addAttr(attr))
          parent.spliceContent(i, 1, def)
        }
      }

    } else if (!elem.isEmpty()) {
      walk(elem, defsById, usedById)
    }
  })
}