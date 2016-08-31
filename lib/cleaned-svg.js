const assert = require('assert');
const xmldoc = require('xmldoc');

const optimizeSvg = require('./tools/optimize-svg');
const extension = '.svg';

function convert(inputXml, options = {}) {
  const codeIndent = options.codeIndent;
  const compressed = options.compressed;
  assert(typeof codeIndent == 'string', 'codeIndent must be a string');
  assert(typeof compressed == 'boolean', 'compressed must be a boolean');
  assert(/^\s*$/.test(codeIndent), 'codeIndent must be whitespace only');

  return optimizeSvg(inputXml, {noArcs: true})
    .then(optimizedSvg => compile(optimizedSvg));

  function compile(svg) {
    const doc = new xmldoc.XmlDocument(svg);
    let result = doc.toString({ trimmed: false, compressed: compressed });
    result = result.replace(/  /g, codeIndent);
    return Promise.resolve(result);
  }
};

function convertAll(contents, options = {}) {
  const codeIndent = options.codeIndent;
  assert(typeof codeIndent == 'string', 'codeIndent must be a string');
  assert(/^\s*$/.test(codeIndent), 'codeIndent must be whitespace only');

  return Promise.all(contents.map(content => convert(content.svg, options)
      .then(code => ({ name: `${content.name}${extension}`, code })
    )))
}

exports.extension = extension;
exports.convert = convert;
exports.convertAll = convertAll;
