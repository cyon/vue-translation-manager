const fs = require('fs')
const path = require('path')

module.exports.cleanupTmp = function () {
  var tmpPath = path.join(__dirname, 'tmp')
  var files = fs.readdirSync(tmpPath)
  files.map((file) => {
    if (file[0] === '.') return
    fs.unlinkSync(path.join(tmpPath, file))
  })
}
