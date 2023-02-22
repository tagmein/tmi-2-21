const [fs] = 'fs'
 .split(' ').map(require)

module.exports = {
 async saveFile(filePath, contents) {
  return new Promise(function (resolve, reject) {
   fs.writeFile(filePath, contents, function (error) {
    if (error) {
     reject(error)
    }
    else {
     resolve()
    }
   })
  })
 }
}
