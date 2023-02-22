const [fs] = 'fs'
 .split(' ').map(require)

module.exports = {
 async deleteFile(filePath) {
  return new Promise(function (resolve, reject) {
   fs.unlink(filePath, function (error) {
    if (error) {
     if (error.code === 'ENOENT') {
      resolve()
     }
     else {
      reject(error)
     }
    }
    else {
     resolve()
    }
   })
  })
 }
}
