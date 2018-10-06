const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const fs = require('fs')

const config = require('./config')
const Data = require('./lib/data')

const data = new Data()
data.update('test', 'newFile', { foo: 'Mr bean talking' })
  .then((value) => console.log('success', value))
  .catch((err) => {
    return console.log('error', err)
  })
const httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res)
})

httpServer.listen(3000, function () {
  console.info(`The HTTP server is running on port ${config.httpPort}`)
})

const httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
}

const httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  unifiedServer(req, res)
})

httpsServer.listen(config.httpsPort, function () {
  console.info(`The HTTPS server is running on port ${config.httpsPort}`)
})

const unifiedServer = function (req, res) {
  const parsedUrl = url.parse(req.url, true)

  const path = parsedUrl.pathname
  const trimmedPath = path.replace(/^\/+|\/+$/g, '')

  const queryStringObject = parsedUrl.query

  const method = req.method.toLowerCase()

  const headers = req.headers

  const decoder = new StringDecoder('utf-8')
  let buffer = ''
  req.on('data', function (data) {
    buffer += decoder.write(data)
  })

  req.on('end', function () {
    buffer += decoder.end()

    const chosenHandler = typeof (router[trimmedPath]) !==
    'undefined' ? router[trimmedPath] : handlers.notFound

    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    }

    chosenHandler(data, function (statusCode, payload) {
      statusCode = typeof (statusCode) === 'number' ? statusCode : 200

      payload = typeof (payload) === 'object' ? payload : {}

      const payloadString = JSON.stringify(payload)

      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadString)
    })
  })
}

const handlers = {}

handlers.hello = function (data, callback) {
  callback(new Error(406), { 'response': 'Hello, how are you doing? Welcome to Nodejs Master class' })
}

handlers.notFound = function (data, callback) {
  callback(new Error(404))
}

const router = {
  'hello': handlers.hello
}
