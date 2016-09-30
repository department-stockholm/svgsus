const assert = require('assert');
const cheerio = require('cheerio');
const {Parser} = require('cssparser');

function inlineStyle(svgInput) {
  assert(typeof svgInput == 'string', 'svgInput must be a string');
  const $ = cheerio.load(svgInput, {
    lowerCaseTags: false,
    lowerCaseAttributeNames: false,
    recognizeCDATA: true
  });

  if(!$) {
    return Promise.reject(new Error('invalid svg while parsing in substituteRefs'));
  }

  const style = $('style');
  const svg = $('svg');

  if (!style || !style.text()) {
    return Promise.resolve(svgInput);
  }

  const cssText = style.text().replace('<![CDATA[', '').replace(']]>', '')
  const cssParser = new Parser();
  const cssContent = cssParser.parse(cssText);

  if(cssContent.rulelist && Array.isArray(cssContent.rulelist)) {
    inlineStyleRules($, svg, cssContent.rulelist);
    style.remove()
  }
  return Promise.resolve($.xml());
}

function inlineStyleRules($, svg, rulelist) {
  rulelist
    .filter(rule => rule.type == 'style')
    .forEach(rule => {
      svg.find(rule.selector).each((index, item) => {
        let item$ = $(item)
        let styles = (item$.attr('style') || '').split(';')
        for (let key in rule.declarations) {
          styles.push(`${key}: ${rule.declarations[key]};`)
        }
        item$.attr('style', styles.join(''))
      });
    });
}

module.exports = inlineStyle;
