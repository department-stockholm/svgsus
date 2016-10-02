
const {parseString} = require('xml2js')

function parseXmlString (inputXml) {
  return new Promise(function (resolve, reject) {
    parseString(inputXml,
      { explicitArray: true },
      function (err, xml) {
        if (err) reject(err)
        else resolve(xml)
      })
  })
}

module.exports = parseXmlString
