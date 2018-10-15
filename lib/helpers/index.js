
const crypto = require('crypto')
const https = require('http')
const queryString = require('querystring')
const config = require('../../config')

const helpers = {}

/**
 * Parse a JSON string to an object in all cases,
 * without throwing
 * @param {String} str
 */
helpers.parseJsonToObject = function (str) {
  try {
    const obj = JSON.parse(str)
    return obj
  } catch (e) {
    return {}
  }
}

/**
 * Create a SHA256 hash
 * @param {String} str
 * @return {String|Boolean} hashed value or false
 */
helpers.hash = (str) => {
  if (typeof str === 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret)
      .update(str).digest('hex')

    return hash
  }

  return false
}

/**
 * Create a string of random alphanumeric characters,
 * of a given length
 * @param {String} strLength
 * @return {String|Boolean} random characters or false
 */
helpers.createRandomString = (strLength) => {
  strLength = typeof (strLength) === 'number' &&
  strLength > 0 ? strLength : false

  if (strLength) {
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'

    let str = ''

    for (let i = 1; i <= strLength; i++) {
      const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
      str += randomCharacter
    }

    return str
  }
  return false
}

/**
 * Send text messages using Twilio
 * @param {String} phone user's phone number
 * @param {String} msg message to be sent to user
 *
 * @return {Promise} Promise
 */
helpers.sendTwilioSms = (phone, msg) => {
  // Validate parameters
  phone = typeof (phone) === 'string' && phone.trim().length === 10 ? phone.trim() : false
  msg = typeof (msg) === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false

  return new Promise((resolve, reject) => {
    if (phone && msg) {
      // Configure the request payload
      const payload = {
        'From': config.twilio.fromPhone,
        'To': `+1${phone}`,
        'Body': msg
      }

      const stringPayload = queryString.stringify(payload)

      // Configure the request details
      const requestDetails = {
        'protocol': 'http:',
        'hostname': 'api.twilio.com',
        'method': 'POST',
        'path': `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
        'auth': `${config.twilio.accountSid}:${config.twilio.authToken}`,
        'headers': {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(stringPayload)
        }
      }

      // Instantiate the request object
      const req = https.request(requestDetails, (res) => {
        // Grab the status of the sent request
        const status = res.statusCode
        // Callback successfully if the request went through
        if (status === 200 || status === 201) {
          return resolve(false)
        }

        resolve(`Status code returned was ${status}`)
      })

      // Bind to the error event so it doesn't get thrown
      req.on('error', (e) => {
        reject(e)
      })
      // Add the payload
      req.write(stringPayload)

      // End the request
      return req.end()
    }

    const twilioError = new Error()
    twilioError.message = 'Given parameters were missing or invalid'
    reject(twilioError)
  })
}
module.exports = helpers
