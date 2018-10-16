const Data = require('../data/')

const _data = new Data()

class Validation {
  /**
   *
   * @param {String|Boolean} fieldInfo
   */

  _verifyInputFieldData (fieldInfo) {
    if (typeof fieldInfo === 'string' && !fieldInfo.payload) {
      return typeof (fieldInfo) ===
    'string' && fieldInfo.trim().length > 0
        ? fieldInfo.trim() : false
    }

    if (typeof fieldInfo === 'boolean' && !fieldInfo.payload) {
      console.log('in field bool')
      //   return !!(typeof (fieldInfo) === 'boolean' &&
      // fieldInfo.payload.extend === true)
      return true
    }

    if (typeof fieldInfo === 'undefined') {
      return false
    }

    return !!(typeof (fieldInfo.payload.extend) === 'boolean' &&
    fieldInfo.payload.extend === true)
  }

  /**
   *
   * @param {String} id
   * @param {Number} phone
   *
   * @return {Promise} Promise
   */
  _verifyToken (id, phone) {
    return new Promise((resolve, reject) => {
      if (id && phone) {
        return _data.read('tokens', id)
          .then((tokenData) => {
            if (tokenData.phone === phone &&
          tokenData.expires > Date.now()) {
              return resolve(true)
            }
            const missingTokenError = new Error()
            missingTokenError.message = {
              response: 'Missing required token in header, or token is invalid'
            }
            missingTokenError.statusCode = 403
            reject(missingTokenError)
          })
          .catch(() => reject(new Error(false)))
      }

      const missingTokenCredentialsError = new Error()
      missingTokenCredentialsError.message = {
        response: 'Missing token and phone Number'
      }

      missingTokenCredentialsError.statusCode = 400
      return reject(missingTokenCredentialsError)
    })
  }
}

module.exports = Validation
