
exports.type = 'perItem'
exports.active = false
exports.description = 'removes width and height in presence of viewBox'
exports.name = 'preferViewBox'

exports.fn = function (item) {
  if (
      item.isElem('svg') &&
      item.hasAttr('width') &&
      item.hasAttr('height') &&
      !item.hasAttr('viewBox')
    ) {
    const w = item.attr('width').value
    const h = item.attr('height').value
    item.addAttr({
      name: 'viewBox',
      local: 'viewBox',
      prefix: '',
      value: `0 0 ${w} ${h}`
    })
  }
}
