const config = require('../../config')
const crypto = require('crypto')

const helpers = {}

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function (str) {
  try {
    const obj = JSON.parse(str)
    return obj
  } catch (e) {
    return {}
  }
}

// Create a SHA256 hash
helpers.hash = (str) => {
  if (typeof str === 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret)
      .update(str).digest('hex')

    return hash
  }

  return false
}
module.exports = helpers
