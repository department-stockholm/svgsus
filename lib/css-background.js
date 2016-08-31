const assert = require('assert');

const cleanSvg = require('./cleaned-svg').convert;
const extension = '.css';

function convert(inputXml, options = {}) {
  const codeIndent = options.codeIndent;
  assert(typeof codeIndent == 'string', 'codeIndent must be a string');
  assert(/^\s*$/.test(codeIndent), 'codeIndent must be whitespace only');

  return cleanSvg(inputXml, {compressed: true, codeIndent})
    .then(optimizedSvg => compile(optimizedSvg));

  function compile(svg) {
    return `${codeIndent}background-image: url('data:image/svg+xml;utf8,${svg}')`;
  }
};

function convertAll(contents, options = {}) {
  const codeIndent = options.codeIndent;
  assert(typeof codeIndent == 'string', 'codeIndent must be a string');
  assert(/^\s*$/.test(codeIndent), 'codeIndent must be whitespace only');

  function varName(str) {
    // logo.svgsus-large home.svg => logo-svgsus-large-home-svg
    var arr = str.split(/[ ,.-]+/);
    return arr.join('-');
  }

  function joinContents(items) {
    let results = '';
    items.forEach(item => {
      results += `.${varName(item.name)} {\n`
        + `${item.converted}\n`
        + '}\n\n';
    });
    return results;
  }

  return Promise.all(contents.map(content => convert(content.svg, options)
      .then(converted => ({ converted, name: content.name })
    )))
    .then(separated => ([{ name: `svgsus.${extension}`, code: joinContents(separated) }]))
}

exports.extension = extension;
exports.convert = convert;
exports.convertAll = convertAll;