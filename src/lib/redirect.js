module.exports = {
 redirect(to) {
  return {
   statusCode: 301,
   headers: [
    ['Location', to]
   ]
  }
 }
}
