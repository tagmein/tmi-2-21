module.exports = {
 randomCode(length = 6) {
  return Array(length).fill()
   .map(() => Math.floor(100 * Math.random()) % 10)
   .join('')
 }
}
