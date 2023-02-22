const [fs] = 'fs'
 .split(' ').map(require)

module.exports = {
 async ensureDirectoryExists(directoryPath) {
  return new Promise(function (resolve, reject) {
   fs.mkdir(directoryPath, { recursive: true }, function (error) {
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
