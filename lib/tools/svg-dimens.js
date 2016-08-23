const fs = require('fs');
const parseXmlString = require('./parse-xml-string');

function readFile(path, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, encoding, (err, buf) => err ? reject(err) : resolve(buf))
  })
}

function getDimensionsFromSvgFile(svgPath) {
  var path = svgPath.replace('file://', '').replace(/%20/g, ' ');
  return readFile(path, 'utf-8')
    .then(parseXmlString)
    .then(xml => getDimensions(xml.svg))
}


function getDimensions(svg) {
  var widthAttr = svg.$.width;
  var heightAttr = svg.$.height;
  var viewBoxAttr = svg.$.viewBox || svg.$.viewbox;

  if (typeof viewBoxAttr === 'undefined') {
    if (typeof widthAttr === 'undefined' || typeof heightAttr === 'undefined') {
      console.error('svg size not specified, using (-1, -1)');
      return {x: 0, y: 0, width: -1, height: -1};
    } else {
      return {x: 0, y: 0, width: convertDimensionToPx(widthAttr), height: convertDimensionToPx(heightAttr)};
    }
  } else {
    /*var viewBoxAttrParts = viewBoxAttr.split(/[,\s]+/);
    if (viewBoxAttrParts[0] > 0 || viewBoxAttrParts[1] > 0) {
      console.error('viewbox minx/miny is other than 0 (not supported)');
    }*/
    var viewBoxAttrParts = viewBoxAttr.split(/[,\s]+/);
    return {x: viewBoxAttrParts[0], y: viewBoxAttrParts[1], width: viewBoxAttrParts[2], height: viewBoxAttrParts[3]};
  }
}

function convertDimensionToPx(dimen) {
  var val = removeNonNumeric(dimen);
  var METER_TO_PX = 3543.30709;
  var INCH_TO_PX = 90;
  var PT_TO_PX = 1.25;
  var PC_TO_PX = 15;
  var FT_TO_PX = 1080;

  if (dimen.endsWith('mm')) {
    return val * (METER_TO_PX / 1000);
  } else if (dimen.endsWith('cm')) {
    return val * (METER_TO_PX / 100);
  } else if (dimen.endsWith('m')) {
    return val * METER_TO_PX;
  } else if (dimen.endsWith('in')) {
    return val * INCH_TO_PX;
  } else if (dimen.endsWith('pt')) {
    return val * PT_TO_PX;
  } else if (dimen.endsWith('pc')) {
    return val * PC_TO_PX;
  } else if (dimen.endsWith('ft')) {
    return val * FT_TO_PX;
  } else {
    return val;
  }
}

function removeNonNumeric(input) {
  if (typeof input === 'undefined') return input;
  return input.replace(/[^0-9.]/g, '');
}

exports.removeNonNumeric = removeNonNumeric;
exports.convertDimensionToPx = convertDimensionToPx;
exports.getDimensions = getDimensions;
exports.getDimensionsFromSvgFile = getDimensionsFromSvgFile;
