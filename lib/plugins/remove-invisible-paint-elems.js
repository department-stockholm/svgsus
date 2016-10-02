exports.type = 'perItem'
exports.active = true
exports.description = 'removes elements with no / transparent fill and stroke'
exports.name = 'removeInvisiblePaint' // Name isn't standard but we need it because our is local

/**
* Custom plugins aren't *really* supported, but can be hacked in, see:
* https://github.com/svg/svgo/issues/564
*/
exports.params = {
}

function invisibleFill (item) {
  return item.hasAttr('fill', 'none')
}

function invisibleStroke (item) {
  return !item.hasAttr('stroke') || item.hasAttr('stroke', 'none') || item.hasAttr('stroke-width', '0')
}

exports.fn = function (item) {
  return (
    item.elem &&
    !item.isElem('g') &&
    !item.isElem('svg') &&
    invisibleFill(item) &&
    invisibleStroke(item)
  ) !== true
}
