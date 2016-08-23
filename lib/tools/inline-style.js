const assert = require('assert');
const cheerio = require('cheerio');
const {Parser} = require('cssparser');

function inlineStyle(svgInput) {
  assert(typeof svgInput == 'string', 'svgInput must be a string');
  let $ = cheerio.load(svgInput, {
    lowerCaseTags: false,
    lowerCaseAttributeNames: false,
    recognizeCDATA: true
  });
  if(!$) {
    return Promise.reject(new Error('invalid svg while parsing in substituteRefs'));
  }

  let style = $('style');
  let svg = $('svg');

  if(!style || !style.text()) {
    return Promise.resolve(svgInput);
  }

  let cssParser = new Parser();
  let cssContent = cssParser.parse(style.text().replace('<![CDATA[', '').replace(']]>', ''));
  inlineStyleRules($, svg, cssContent.rulelist);
  return Promise.resolve($.xml());
}

function inlineStyleRules($, svg, rulelist) {
  if(!rulelist || !Array.isArray(rulelist)) {
    return;
  }
  rulelist.forEach(rule => {
    if(rule.type == 'style') {
      svg.find(rule.selector).each((index, item) => {
        for(let key in rule.declarations) {
          let xmlItem = $(item);
          // Let's skip inject if style value already is set to element
          if(!xmlItem.attr(key)) {
            xmlItem.attr(key, rule.declarations[key]);
          }
        }
      });
    }
  });
}

module.exports = inlineStyle;
