module.exports = {
 json(data, statusCode = 200) {
  const content = JSON.stringify(data)
  return {
   statusCode,
   content,
   headers: [
    [
     'Content-Length',
     content.length,
     'Content-Type',
     'application/json; charset=utf-8',
    ],
   ],
  }
 },
}
