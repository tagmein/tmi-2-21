const [fs, path] = 'fs path'.split(' ').map(require)

const contentTypes = {
 css: 'text/css',
 gif: 'image/gif',
 html: 'text/html',
 jpeg: 'image/jpeg',
 jpg: 'image/jpeg',
 js: 'application/javascript',
 json: 'application/json',
 png: 'image/png',
 svg: 'image/svg+xml',
}

function formatItems(items) {
 return items.map(function (item) {
  return {
   name: item.name,
   type: item.isDirectory() ? 'directory' : 'file',
  }
 })
}

module.exports = {
 async replyWithFile(filePath) {
  return new Promise(function (resolve, reject) {
   fs.readFile(filePath, async function (error, content) {
    if (error) {
     if (error.code === 'ENOENT') {
      resolve({ statusCode: 404 })
     } else if (error.code === 'EISDIR') {
      try {
       fs.readdir(
        filePath,
        { withFileTypes: true },
        function (dirError, items) {
         if (dirError) {
          reject(dirError)
         } else {
          const dirContent = JSON.stringify(formatItems(items))
          resolve({
           statusCode: 200,
           headers: [
            ['Access-Control-Allow-Origin', '*'],
            ['Content-Length', dirContent.length],
            ['Content-Type', 'application/json'],
           ],
           content: dirContent,
          })
         }
        }
       )
      } catch (e) {
       reject(e)
      }
     } else {
      reject(error)
     }
    } else {
     const type = path.extname(filePath).substring(1)
     resolve({
      statusCode: 200,
      headers: [
       ['Access-Control-Allow-Origin', '*'],
       ['Content-Type', contentTypes[type] ?? 'text/plain'],
      ],
      content,
     })
    }
   })
  })
 },
}
