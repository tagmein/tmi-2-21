const [fs] = 'fs'
 .split(' ').map(require)

module.exports = {
 async readFile(filePath) {
  return new Promise(function (resolve, reject) {
   fs.readFile(filePath, 'utf-8', function (error, contents) {
    if (error) {
     reject(error)
    }
    else {
     resolve(contents)
    }
   })
  })
 }
}
