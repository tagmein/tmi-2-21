const [fs, path] = 'fs path'.split(' ').map(require)

const dataRoot = path.join(__dirname, '..', '..', 'private', 'data')

if (!fs.existsSync(dataRoot)) {
 fs.mkdirSync(dataRoot, { recursive: true })
}

module.exports = {
 data: {
  async read(key) {
   return new Promise(function (resolve, reject) {
    fs.readFile(
     path.join(dataRoot, encodeURIComponent(key)),
     { encoding: 'utf-8' },
     function (error, contents) {
      if (error) {
       if (error.message.includes('ENOENT')) {
        resolve({})
       } else {
        reject(error)
       }
      } else {
       resolve(JSON.parse(contents))
      }
     }
    )
   })
  },
  async remove(key) {
   return new Promise(function (resolve, reject) {
    fs.unlink(path.join(dataRoot, encodeURIComponent(key)), function (error) {
     if (error) {
      reject(error)
     } else {
      resolve()
     }
    })
   })
  },
  async write(key, value) {
   return new Promise(function (resolve, reject) {
    fs.writeFile(
     path.join(dataRoot, encodeURIComponent(key)),
     JSON.stringify(value),
     function (error) {
      if (error) {
       reject(error)
      } else {
       resolve()
      }
     }
    )
   })
  },
 },
}
