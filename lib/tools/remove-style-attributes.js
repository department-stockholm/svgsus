const assert = require('assert');
const xml2js = require('xml2js');
const defaultAttributes = ['fill', 'stroke', 'opacity', 'fill-rule', 'stroke-width'];

function removeStyleAttributes(svgInput, options = {}) {
  const attributes = options.attributes || defaultAttributes;
  assert(typeof svgInput == 'string', 'svgInput must be a string');
  assert(Array.isArray(attributes), 'attributes must be an array');
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

  function removeElementStyleAttributes(element) {
    for(var key in element.$) {
      // Check if invisible, then remove
      if(attributes.indexOf(key) > -1) {
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

}
module.exports =  removeStyleAttributes;
