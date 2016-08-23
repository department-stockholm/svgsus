
const SVGO = require('svgo');

function optimizeSvg(svg, options = {}) {
  const plugins = [];
  if (options.noArcs) {
    plugins.push({
      convertPathData: {
        makeArcs: { threshold: 0, tolerance: 0 }
      }
    });
  }

  if(options.removeUnknowns) {
    plugins.push({removeUnknownsAndDefaults: false});
  }

  const svgo = new SVGO({plugins});

  return new Promise(function(resolve, reject) {
    try {
      svgo.optimize(svg, function(result) {
        if(result && result.data) resolve(result.data);
        else reject(new Error('svg optimizer failed'));
      });
    } catch(err) {
      reject(err);
    }
  });
}

module.exports = optimizeSvg;
