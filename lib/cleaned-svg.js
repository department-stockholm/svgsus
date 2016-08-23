const assert = require('assert');
const xmldoc = require('xmldoc');

const optimizeSvg = require('./tools/optimize-svg');

function SvgCleaner(inputXml, options = {}) {
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

exports.convert = SvgCleaner;
