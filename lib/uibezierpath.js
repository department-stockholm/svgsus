const assert = require('assert');

const svgPathToSwift = require('./tools/svg-path-to-swift');
const substituteRefs = require('./tools/substitute-refs');
const removeInvisiblePaths = require('./tools/remove-invisible-paths');
const removeStyleAttributes = require('./tools/remove-style-attributes');
const optimizeSvg = require('./tools/optimize-svg');
const parseXmlString = require('./tools/parse-xml-string');
const extension = '.swift';

function convert(inputXml, options = {}) {
  const codeType = options.codeType;

  assert(['AppKit', 'UIKit'].indexOf(codeType) !== -1, 'codeType must be either "AppKit" or "UIKit"');

  // We start of by include ref content in the svg, then remove all style attrs
  return substituteRefs(inputXml)
    .then(outputXml => removeInvisiblePaths(outputXml))
    .then(outputXml => removeStyleAttributes(outputXml))
    .then(outputXml => optimizeSvg(outputXml, {noArcs: true}))
    .then(outputXml => parseXmlString(outputXml))
    .then(outputXml => generateCode(outputXml));

  function generateCode(xml) {
    // Right now assuming the clean always leave at max one group for us to work with
    const paths = xml.svg.path || xml.svg.g[0].path;
    const name = 'path';

    if(!paths) {
      return '';
    }

    let result = '';
    paths.forEach((path, i) => {
      let data = {
          pathData: path.$.d,
          pathName: name,
          codeIndent: '',
          codeType: codeType,
          skipStart: (i != 0),
          skipEnd: true
      };
      result += svgPathToSwift(data);
    });
    return result;
  }
};

function convertAll(contents, options = {}) {
  const codeIndent = options.codeIndent;
  assert(typeof codeIndent == 'string', 'codeIndent must be a string');
  assert(/^\s*$/.test(codeIndent), 'codeIndent must be whitespace only');

  function varName(str) {
    // logo.svgsus-large home.svg => logoSvgsusLargeHomeSvg
    var arr = str.split(/[ ,.-]+/);
    for(var i=0,l=arr.length; i<l; i++) {
        arr[i] = arr[i].substr(0,1)[i == 0 ? 'toLowerCase' : 'toUpperCase']() +
                 (arr[i].length > 1 ? arr[i].substr(1).toLowerCase() : '');
    }
    return arr.join('');
  }

  function joinContents(items) {
    let results = '';
    items.forEach(item => {
      results += `var ${varName(item.name)}: UIBezierPath = {\n`
        + `${item.converted}\n`
        + `return path\n`
        + '}()\n\n';
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
