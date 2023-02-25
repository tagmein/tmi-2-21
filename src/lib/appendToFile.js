const [fs] = 'fs'.split(' ').map(require)

module.exports = {
 async appendToFile(filePath, contents) {
  return new Promise(function (resolve, reject) {
   fs.writeFile(filePath, contents, { flag: 'a+' }, function (error) {
    if (error) {
     reject(error)
    } else {
     resolve()
    }
   })
  })
 },
}
