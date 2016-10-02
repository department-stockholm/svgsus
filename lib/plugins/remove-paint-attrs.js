exports.type = 'perItem'
exports.active = true
exports.description = 'removes paint (fill & stroke) attributes'
exports.name = 'removePaintAttributes' // Name isn't standard but we need it because our is local

exports.params = {
  attributes: ['fill', 'stroke', 'opacity', 'fill-rule', 'stroke-width']
}
/**
* Custom plugins aren't *really* supported, but can be hacked in, see:
* https://github.com/svg/svgo/issues/564
*/

exports.fn = function (item, {attributes}) {
  if (item.elem) {
    item.eachAttr(attr => {
      if (attributes.indexOf(attr.name) !== -1) {
        item.removeAttr(attr.name)
      }
    })
  }
}
