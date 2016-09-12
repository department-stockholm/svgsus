const assert = require('assert');
const xmldoc = require('xmldoc');
const substituteRefs = require('./tools/substitute-refs');
const removeInvisiblePaths = require('./tools/remove-invisible-paths');
const removeStyleAttributes = require('./tools/remove-style-attributes');
const optimizeSvg = require('./tools/optimize-svg');

const extension = '.svg';

function convert(inputXml, options = {}) {
  const codeIndent = options.codeIndent;
  const name = options.name || 'svgsus-symbol';
  const stripStyle = options.stripStyle === undefined ? true : options.stripStyle;
  const compressed = options.compressed === undefined ? true : options.compressed;
  assert(typeof codeIndent == 'string', 'codeIndent must be a string');
  assert(typeof name == 'string', 'name must be a string');
  assert(typeof stripStyle == 'boolean', 'stripStyle must be a boolean');
  assert(typeof compressed == 'boolean', 'compressed must be a boolean');
  assert(/^\s*$/.test(codeIndent), 'codeIndent must be whitespace only');

  return removeInvisiblePaths(inputXml)
    .then(substituteRefs)
    .then(outputXml =>
      stripStyle ? removeStyleAttributes(outputXml,
        { attributes: ['fill', 'stroke', 'fill-rule']}) : outputXml)
    .then(removeInvisiblePaths)
    .then(outputXml => optimizeSvg(outputXml, {removeTitle: true}))
    .then(outputXml => compile(outputXml, name));

  function compile(svg, name) {
    const doc = new xmldoc.XmlDocument(svg);
    const symbol = createSymbol(doc, name);
    let result = symbol.toString({ trimmed: false, compressed: compressed });
    result = result.replace(/  /g, codeIndent);
    return Promise.resolve(result);
  }

  function createSymbol(doc, name) {
    const viewBox = extractViewBox(doc);
    const symbol = new xmldoc.XmlDocument(`<symbol id="${name}" viewBox="${viewBox}"></symbol>`);
    const relevantChildren = doc.childrenNamed('path').concat(doc.childrenNamed('g'));
    symbol.children = relevantChildren;
    return symbol;
  }

  function extractViewBox(doc) {
    return doc.attr.viewBox ||
    (doc.attr.width && doc.attr.height
      ? `0 0 ${doc.attr.width} ${doc.attr.height}` :
      '0 0 0 0');
  }
};

function convertAll(contents, options = {}) {
  const compressed = options.compressed === undefined ? true : options.compressed;
  assert(typeof compressed == 'boolean', 'compressed must be a boolean');

  function varName(str) {
    // logo.svgsus-large home.svg => logo-svgsus-large-home-svg
    var arr = str.split(/[ ,.-_]+/);
    return arr.join('-');
  }

  function joinContents(items) {
    var result = '<svg xmlns="http://www.w3.org/2000/svg">\n';
    result += items.join('\n');
    result += '\n</svg>';
    return result;
  }

  function fileName() {
    if (contents.length) {
      return [
        varName(contents[0].name),
        contents.length > 1 ? '+' + (contents.length - 1) : '',
        extension
      ].join('');
    } else {
      return 'svgsus' + extension
    }
  }

  function appendName(name, options) {
    let result = {name: name};
    Object.keys(options).forEach(key => result[key] = options[key]);
    return result;
  }

  return Promise.all(contents.map(content =>
      convert(content.svg, appendName(varName(content.name), options))
    )).then(separated => ([{ name: fileName(), code: joinContents(separated) }]))
}
exports.extension = extension;
exports.convert = convert;
exports.convertAll = convertAll;
