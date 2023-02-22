#!/bin/env -S node

const [http, fs, path, qs] = 'http fs path querystring'
 .split(' ').map(require)

const { appendToFile } = require('./lib/appendToFile.js')
const { data } = require('./lib/data.js')
const { deleteFile } = require('./lib/deleteFile.js')
const { ensureDirectoryExists } = require('./lib/ensureDirectoryExists.js')
const { html } = require('./lib/html.js')
const { json } = require('./lib/json.js')
const { parseRequestBody } = require('./lib/parseRequestBody.js')
const { randomCode } = require('./lib/randomCode.js')
const { readFile } = require('./lib/readFile.js')
const { redirect } = require('./lib/redirect.js')
const { replyWithFile } = require('./lib/replyWithFile.js')
const { saveFile } = require('./lib/saveFile.js')

const portEnv = parseInt(process.env.PORT, 10)
const port = Number.isFinite(portEnv) && portEnv >= 1 && portEnv < 65536
 ? portEnv
 : 4321

const rootPath = path.join(__dirname, '..', 'public')

console.log('Serving', rootPath)

function unauthorized() {
 return html('<div class="message"><span>Not authorized</span></div>', 401)
}

async function reply(requestMethod, requestPath, requestParams, requestBody, requestHeaders) {
 const { key, ...requestBodyOther } = requestBody
 const accountKey = key ?? requestHeaders['x-key']
 const session = accountKey
  ? await data.read(`key:${accountKey}`)
  : undefined
 const account = session?.email
  ? await data.read(`account:${session.email}`)
  : undefined
 switch (`${requestMethod} ${requestPath}`) {
  case 'GET /profile.json':
   if (!account) {
    return unauthorized()
   }
   return json({ ...account, email: session.email })

  case 'POST /signin':
   const email = requestBodyOther.email.trim().toLowerCase()
   const profileData = await data.read(`account:${email}`)
   if (profileData.password === requestBodyOther.password) {
    const newKey = randomCode(40)
    const timestamp = Date.now()
    await data.write(`key:${newKey}`, { email, timestamp })
    if (!('accountId' in profileData)) {
     profileData.accountId = randomCode(40)
     await data.write(`account:${email}`, profileData)
     await data.write(`accountId:${profileData.accountId}`, { email })
    }
    return html(`<script>
     localStorage.setItem('key', ${JSON.stringify(newKey)})
     location.replace(${JSON.stringify(requestBodyOther.redirect)})
    </script>`)
   }
   else {
    return html('Email or password is incorrect. <a onclick="history.go(-1)">Try again</a>')
   }

  case 'POST /profile/create':
   if (!account) {
    return unauthorized()
   } {
    const email = requestBodyOther.email.trim()
    if (email.length > 100) {
     return html('That email address is too long, use 100 characters or less. <a onclick="history.go(-1)">Try again</a>')
    }
    const existingProfile = await data.read(`account:${email}`)
    if (existingProfile?.password) {
     return html('That email address is already registered as a Tag Me In account. <a onclick="history.go(-1)">Try again</a>')
    }
    const password = randomCode(20)
    await data.write(`account:${email}`, { password })
    return html(`Created account for ${JSON.stringify(email)} with password ${password} - be sure to share the password with the new user. <a href="/">Home</a>`)
   }

  case 'POST /profile/update':
   if (!account) {
    return unauthorized()
   }
   const displayName = requestBodyOther.displayName.trim()
   if (displayName.length > 100) {
    return html('That name is too long, use 100 characters or less. <a onclick="history.go(-1)">Try again</a>')
   }
   await data.write(`account:${session.email}`, { ...account, displayName })
   return redirect('/#profile')

  case 'POST /topic/create':
   if (!account) {
    return unauthorized()
   }
   await ensureDirectoryExists(
    path.join(
     rootPath,
     'topics',
     encodeURIComponent(requestBodyOther.topic)
    )
   )
   return redirect('/')

  case 'POST /topic/post/delete':
   if (
    !account ||
    !(requestParams.id?.startsWith?.(account.accountId))
   ) {
    return unauthorized()
   }
   {
    const { id, topic, epoch } = requestParams
    const epochFilePath = path.join(
     rootPath,
     'topics',
     encodeURIComponent(topic),
     epoch
    )
    const existingEpochFile = await readFile(epochFilePath)
    const stringId = JSON.stringify(id)
    const postStart = `[${stringId},`
    const postEnd = `,${stringId}],\n`
    const postStartIndex = existingEpochFile.indexOf(postStart)
    const postEndIndex = existingEpochFile.indexOf(postEnd)
    await saveFile(
     epochFilePath,
     existingEpochFile.substring(0, postStartIndex) +
     existingEpochFile.substring(postEndIndex + postEnd.length)
    )
    return { statusCode: 201 }
   }

  case 'POST /topic/write':
   if (!account) {
    return unauthorized()
   }
   {
    const { accountId, displayName = session.email } = account
    const { topic, title, content } = requestBodyOther
    if (title?.trim()?.length > 0 || content?.trim()?.length > 0) {
     await ensureDirectoryExists(
      path.join(
       rootPath,
       'topics',
       encodeURIComponent(topic)
      )
     )
     const timestamp = Date.now()
     const epoch = Math.floor(timestamp / 1e8)
     const id = `${account.accountId}${timestamp.toString()}${randomCode(16)}`
     await appendToFile(
      path.join(
       rootPath,
       'topics',
       encodeURIComponent(topic),
       epoch.toString(10)
      ),
      JSON.stringify([
       id,
       {
        accountId,
        id,
        content,
        displayName,
        timestamp,
        title,
       },
       id
      ]) + ',\n'
     )
    }
    else {
     return html(`Must write something: <a onclick="history.go(-1)">Try again</a>`)
    }
   }
   return redirect(`/#topic/${encodeURIComponent(requestBodyOther.topic)}`)

  case 'GET ':
   return replyWithFile(path.join(rootPath, 'main.html'))

  default:
   if (requestMethod !== 'GET') {
    return html('<div class="message"><span>Method not allowed</span></div>', 400)
   }
   try {
    return replyWithFile(path.join(rootPath, requestPath))
   }
   catch (e) {
    if (e.code === 'ENOENT') {
     return html('<div class="message"><span>Not found</span></div>', 404)
    }
    console.error(e)
    return html('<div class="message"><span>Server error</span></div>', 500)
   }
 }
}

async function main() {
 const server = http.createServer(async function (request, response) {
  try {
   const { method: requestMethod } = request
   const [requestPath, requestParamString] = request.url.split('?')
   const requestParams = qs.parse(requestParamString ?? '')
   console.log(requestMethod, requestPath, JSON.stringify(requestParams))
   const requestBody = await parseRequestBody(request)
   const {
    statusCode = 200,
    contentType = 'text/plain; charset=utf-8',
    content = '',
    headers = []
   } = (await reply(
    requestMethod,
    requestPath.replace(/\/$/, ''), // important to prevent listing /home/
    requestParams,
    requestBody,
    request.headers
   )) ?? {
     statusCode: 500,
     content: 'Server error'
    }
   response.statusCode = statusCode
   response.setHeader('Content-Type', contentType)
   for (const [k, v] of headers) {
    response.setHeader(k, v)
   }
   response.write(content)
   response.end()
  }
  catch (e) {
   console.error(e)
   response.statusCode = e.statusCode ?? 500
   response.setHeader('Content-Type', 'text/plain; charset=utf-8')
   response.end(e.message)
  }
 })

 server.listen(port, 'localhost', function () {
  console.log(`Tag Me In server listening on http://localhost:${port}`)
 })
}

main().catch(function (e) {
 console.error(e)
})
