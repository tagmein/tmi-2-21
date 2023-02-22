const MAX_REQUEST_BODY_SIZE = 1024 * 512 // 512kb

const { multipart } = require('./multipart')

module.exports = {
 async parseRequestBody(request) {
  return new Promise(function (resolve, reject) {
   let error = false
   const FORM_ENCODING_MULTIPART = 'multipart/form-data'
   const contentTypeHeader = request.headers['content-type'] ?? ''
   const [contentType] = contentTypeHeader.split(';')
   const boundary = multipart.getBoundary(contentTypeHeader)
   if (contentType === FORM_ENCODING_MULTIPART) {
    const bodyChunks = []
    let bodySize = 0
    request.on('data', function (chunk) {
     if (!error) {
      bodyChunks.push(chunk)
      bodySize += chunk.length
      if (bodySize > MAX_REQUEST_BODY_SIZE) {
       error = true
       reject(new Error(`request body size cannot exceed ${MAX_REQUEST_BODY_SIZE} bytes`))
      }
     }
    })
    request.on('end', function () {
     if (!error) {
      const parsedData = multipart.parse(Buffer.concat(bodyChunks), boundary)
      const finalData = {}
      for (const part of parsedData) {
       if ('name' in part) {
        finalData[part.name] =
         'filename' in part
          ? part
          : part.data.toString('utf-8')
       }
      }
      resolve(finalData)
     }
    })
   } else {
    resolve({})
   }
  })
 }
}
