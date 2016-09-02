const assert = require('assert');

const cleanSvg = require('./cleaned-svg').convert;
const extension = '.css';

function convert(inputXml, options = {}) {
  const codeIndent = options.codeIndent;
  assert(typeof codeIndent == 'string', 'codeIndent must be a string');
  assert(/^\s*$/.test(codeIndent), 'codeIndent must be whitespace only');

  return cleanSvg(inputXml, {compressed: true, codeIndent})
    .then(svg => `${codeIndent}background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}')`);
};

function convertAll(contents, options = {}) {
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

  return Promise.all(contents.map(content => convert(content.svg, options)
      .then(converted => ({ converted, name: content.name })
    )))
    .then(separated => ([{ name: fileName(), code: joinContents(separated) }]))
}

exports.extension = extension;
exports.convert = convert;
exports.convertAll = convertAll;
