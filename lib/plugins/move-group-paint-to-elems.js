exports.type = 'perItem'
exports.active = true
exports.description = 'moves some group attributes to the content elements'
exports.name = 'moveGroupPaintToElems'
exports.params = {
  attributes: ['fill', 'stroke', 'opacity', 'fill-rule', 'stroke-width']
}
exports.fn = function(item, {attributes}) {
  // move group paint attr to content's pathElems
  if(item.isElem('g') && !item.isEmpty()) {
    attributes.forEach(attribute => {
      if(item.hasAttr(attribute)) {
        item.content.forEach(inner => {
          if(!inner.hasAttr(attribute)) {
            const attr = item.attr(attribute)
            inner.addAttr({
              name: attr.name,
              local: attr.local,
              prefix: attr.prefix,
              value: attr.value
            });
          }
        })
        item.removeAttr(attribute)
      }
    })
  }
}