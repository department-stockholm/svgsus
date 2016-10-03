const SVGO = require('svgo')

function optimizeSvg (svg, config = {}) {
  const {noArcs, removeTitle, removeHiddenElems, custom} = config
  const plugins = []

  if (noArcs) {
    delete config.noArcs
    plugins.push({
      convertPathData: {
        makeArcs: { threshold: 0, tolerance: 0 }
      }
    })
  }
  if (removeTitle) {
    delete config.removeTitle
    plugins.push({removeTitle: true})
  }
  if (removeHiddenElems) {
    delete config.removeHiddenElems
    plugins.push({removeHiddenElems: true})
  }
  plugins.push({moveElemsAttrsToGroup: false})

  if (custom) {
    delete config.custom
    custom.forEach(plugin => plugins.push({[plugin.name]: plugin}))
  }

  config.plugins = plugins
  config.multipass = true

  return new Promise(function (resolve, reject) {
    try {
      const svgo = new SVGO(config)
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
