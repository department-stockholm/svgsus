exports.type = 'perItemReverse'
exports.active = true
exports.description = 'rename the root <svg> to <symbol>'
exports.name = 'symbolRoot' // Name isn't standard but we need it because our is local

exports.fn = function (item) {
  if (item.isElem('svg')) {
    const sym = item.clone()
    sym.renameElem('symbol')
    return sym
  }
  return item
}
