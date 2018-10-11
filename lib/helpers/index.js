const config = require('../../config')
const crypto = require('crypto')

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
module.exports = helpers
