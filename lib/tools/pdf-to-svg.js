
// HACK poisons the global scope to pretend we're a browser
require('./domstubs')

const pdfjs = require('pdfjs-dist')

function convertPdfData (pdfData) {
  if (pdfData) {
    return pdfjs.getDocument(pdfData)
      .then(doc => doc.getPage(1))
      .then(page => {
        var viewport = page.getViewport(1.0)
        return page.getOperatorList().then(opList => {
          var svgGfx = new pdfjs.SVGGraphics(page.commonObjs, page.objs)
          svgGfx.embedFonts = true
          return svgGfx.getSVG(opList, viewport).then(svg => {
            return svg.toString()
              .replace('xmlns:svg', 'xmlns') // strip :svg to allow skipping namespace
              .replace(/<(\/|)svg:/g, '<$1') // strip namespaces added by pdf.js
          })
        })
      })
  } else {
    return Promise.reject(new Error('No valid pdf data in pasteboard'))
  }
}

module.exports = convertPdfData
