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
      return !!(typeof (fieldInfo) === 'boolean' &&
    fieldInfo.payload.extend === true)
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
      _data.read('tokens', id)
        .then((tokenData) => {
          if (tokenData.phone === phone &&
          tokenData.expires > Date.now()) {
            return resolve(true)
          }
          reject(new Error(false))
        })
        .catch(() => reject(new Error(false)))
    })
  }
}

module.exports = Validation
