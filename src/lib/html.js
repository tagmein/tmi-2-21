module.exports = {
 html(content, statusCode = 200) {
  return {
   statusCode,
   content: `<!doctype html>
 <head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="/main.css" rel="stylesheet" type="text/css" />
  <style>body { display: none; }</style>
 </head>
 <body tabindex="0" class="display">${content}</body>`,
   headers: [['Content-Type', 'text/html; charset=utf-8']],
  }
 },
}
