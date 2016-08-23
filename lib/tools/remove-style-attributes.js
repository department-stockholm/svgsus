const assert = require('assert');
const xml2js = require('xml2js');
const styleAttributes = ['fill', 'stroke', 'opacity', 'fill-rule', 'stroke-width'];

function removeStyleAttributes(svgInput) {
  assert(typeof svgInput == 'string', 'svgInput must be a string');
  return new Promise((fulfill, reject) => {
    xml2js.parseString(svgInput, { explicitArray: true }, (err, xml) => {
      if(err) {
        reject(new Error('invalid svg while parsing in removeStyleAttributes'));
        return;
      }
      removeElementStyleAttributes(xml.svg);
      const result = new xml2js.Builder().buildObject(xml);
      fulfill(result);
    });
  });
}

function removeElementStyleAttributes(element) {
  for(var key in element.$) {
    // Check if invisible, then remove
    if(styleAttributes.indexOf(key) > -1) {
      delete element.$[key];
    }
  }
  for(var key in element) {
    if(key != '$' && Array.isArray(element[key])) {
      element[key].forEach(child => {
        removeElementStyleAttributes(child);
      });
    }
  }
}

module.exports =  removeStyleAttributes;
