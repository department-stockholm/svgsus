const SVGO = require('svgo')

function optimizeSvg (svg, {noArcs, removeTitle, removeHiddenElems, custom} = {}) {
  const plugins = []
  if (noArcs) {
    plugins.push({
      convertPathData: {
        makeArcs: { threshold: 0, tolerance: 0 }
      }
    })
  }
  if (removeTitle) {
    plugins.push({removeTitle: true})
  }
  if (removeHiddenElems) {
    plugins.push({removeHiddenElems: true})
  }
  plugins.push({moveElemsAttrsToGroup: false})
  if (custom) {
    custom.forEach(plugin => plugins.push({[plugin.name]: plugin}))
  }

  const svgo = new SVGO({plugins, multipass: true})
  return new Promise(function (resolve, reject) {
    try {
      svgo.optimize(svg, function (result) {
        if (result && result.error) {
          reject(new Error(result.error))
        } else if (result && result.data) {
          resolve(result.data)
        } else {
          reject(new Error('svg optimizer failed'))
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = optimizeSvg
