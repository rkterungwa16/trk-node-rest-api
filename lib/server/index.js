const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const fs = require('fs')
const path = require('path')

const config = require('../../config')
const helpers = require('../helpers')
const handlers = require('../handlers')
const router = require('../routers')

/**
 * Application server
 */
class Server {
  constructor () {
    this.key = fs.readFileSync(path.join(__dirname, '/../../https/key.pem'))
    this.cert = fs.readFileSync(path.join(__dirname, '/../../https/cert.pem'))
  }

  /**
   * Instantiate http server
   * @return {Object} http server object
   */
  httpServer () {
    return http.createServer((req, res) => {
      this.unifiedServer(req, res)
    })
  }

  /**
   * Instantiate https server
   * @return {Object} https server object
   */
  httpsServer () {
    return https.createServer({
      'key': this.key,
      'cert': this.cert
    }, (req, res) => {
      this.unifiedServer(req, res)
    })
  }

  unifiedServer (req, res) {
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
        'payload': helpers.parseJsonToObject(buffer)
      }

      chosenHandler(data)
        .then((value) => {
          const statusCode = typeof (value.statusCode) === 'number' ? value.statusCode : 200

          const payload = typeof (value.payload) === 'object' ? value.payload : {}

          const payloadString = JSON.stringify(payload)

          res.setHeader('Content-Type', 'application/json')
          res.writeHead(statusCode)
          res.end(payloadString)
        })
        .catch(err => {
          res.setHeader('Content-Type', 'application/json')
          res.writeHead(err.statusCode)
          res.end(JSON.stringify(err.message))
        })
    })
  }

  /**
   * Run server script
   */
  init () {
    this.httpServer().listen(config.httpPort, () => {
      console.info(`The HTTP server is running on port ${config.httpPort}`)
    })

    this.httpsServer().listen(config.httpsPort, function () {
      console.info(`The HTTPS server is running on port ${config.httpsPort}`)
    })
  }
}

module.exports = Server
