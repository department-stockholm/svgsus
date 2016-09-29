exports.type = 'full'
exports.active = true
exports.description = 'insert defs content into svg'
exports.name = 'substituteDefs' // Name isn't standard but we need it because our is local


exports.fn = function(data) {
  const svg = data.content[0]
  if(svg.isElem('svg')) {
    const defs = svg.content.map(child => child.isElem('defs')).filter(child => child)
    console.log('defs', defs)
  }
}