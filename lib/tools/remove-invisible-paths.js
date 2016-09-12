const assert = require('assert');
const xml2js = require('xml2js');

function removeInvisiblePaths(svgInput) {
  assert(typeof svgInput == 'string', 'svgInput must be a string');

  return new Promise((fulfill) => {
    xml2js.parseString(svgInput, { explicitArray: true }, (err, xml) => {
      removeInvisiblePathsFromElement(xml.svg);
      fulfill(new xml2js.Builder().buildObject(xml));
    });
  });
}

function removeInvisiblePathsFromElement(element) {
  for(var key in element) {
    if(key == 'path' && Array.isArray(element[key])) {
      element[key] = element[key].filter(item => !isJsPathInvisible(item));
    } else if(Array.isArray(element[key])) {
      // If it is an array, let's keep digging.
      element[key].forEach(item => {
        removeInvisiblePathsFromElement(item);
      });
    }
  }
}

function isJsPathInvisible(item) {
  return (item.$ != undefined && item.$['fill'] == 'none' && !(item.$['stroke'] && !item.$['stroke-width'] != 0));
}

module.exports = removeInvisiblePaths;
