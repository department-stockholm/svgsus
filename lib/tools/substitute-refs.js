const assert = require('assert');
const cheerio = require('cheerio');

function substituteRefs(svgInput) {
  assert(typeof svgInput == 'string', 'svgInput must be a string');
  let $ = cheerio.load(svgInput, {
    lowerCaseTags: false,
    lowerCaseAttributeNames: false,
    recognizeCDATA: true
  });
  if(!$) {
    return Promise.reject(new Error('invalid svg while parsing in substituteRefs'));
  }
  let svg = $('svg');
  svg.find('use').each((i, item) => {
    substituteUseRef($, svg, $(item));
  });
  return Promise.resolve($.xml());
}


function substituteUseRef($, parent, current) {
  var href = current.attr('xlink:href');
  if (typeof href !== undefined) {
    href = href.trim();
    //Check if valid href
    if (href.length > 1 && href.startsWith('#')) {
      //Find definition in svg
      var defs = $(parent).find(href);
      if (defs.length) {
        defs = defs.clone();
        let attributes = current.prop('attribs') || {};
        //Copy overriding attributes into children
        for(var key in attributes) {
          defs.attr(key, attributes[key]);
        }
        current.replaceWith(defs);
      } else {
        console.warn('Found <use> tag but did not found appropriate block in <defs> for id ' + href);
      }
    }
  }
}

module.exports = substituteRefs;
