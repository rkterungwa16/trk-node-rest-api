const Data = require('../../data')
const helpers = require('../../helpers')

const _data = new Data()

class Token {
  /**
   *
   * @param {String|Boolean} fieldInfo
   */
  _verifyInputFieldData (fieldInfo) {
    if (typeof fieldInfo === 'string') {
      return typeof (fieldInfo) ===
    'string' && fieldInfo.trim().length > 0
        ? fieldInfo.trim() : false
    }
    return !!(typeof (fieldInfo.payload.extend) === 'boolean' &&
    fieldInfo.payload.extend === true)
  }

  /**
   * Get token info with specified id
   *
   * @param {Object} data query string containing id
   *
   * @return {Promise} Promise
   */
  get (data) {
    const id = typeof (data.queryStringObject.id) === 'string' &&
    data.queryStringObject.phone.trim().length === 20
      ? data.queryStringObject.phone.trim() : false

    return new Promise((resolve, reject) => {
      if (id) {
        return _data.read('tokens', id)
          .then(() => resolve({
            statusCode: 200,
            data
          }))
          .catch(() => {
            const tokenNotFoundError = new Error()
            tokenNotFoundError.message = {
              response: 'Token does not exist'
            }

            tokenNotFoundError.statusCode = 404
            reject(tokenNotFoundError)
          })
      }
      const missingFieldsError = new Error()
      missingFieldsError.message = {
        response: 'Missing required field'
      }
      missingFieldsError.statusCode = 404
      reject(missingFieldsError)
    })
  }

  /**
   * Create a new token
   * @param {Object} data
   */
  post (data) {
    const phone = this._verifyInputFieldData(data.payload.phone)
    const password = this._verifyInputFieldData(data.payload.password)

    return new Promise((resolve, reject) => {
      if (
        phone &&
        password
      ) {
        return _data.read('users', phone)
          .then((value) => {
            const hashedPassword = helpers.hash(password)
            if (hashedPassword === value.hashedPassword) {
              const tokenId = helpers.createRandomString(20)
              const expires = Date.now() + 1000 * 60 * 60
              const tokenObject = {
                phone,
                id: tokenId,
                expires: expires
              }

              return _data.create('users', tokenId, tokenObject)
                .then(() => {
                  resolve({
                    statusCode: 200,
                    payload: {
                      response: 'token successfully created'
                    }
                  })
                })
                .catch(() => {
                  const tokenError = new Error()
                  tokenError.message = 'Could not create the new token'
                  tokenError.statusCode = 500
                  reject(tokenError)
                })
            }

            const passwordMatchError = new Error()
            passwordMatchError.message = 'Password did not match the specified user\'s stored password'
            passwordMatchError.statusCode = 400
          })
          .catch(() => {
            const userExistsError = new Error()
            userExistsError.message = {
              response: 'Could not find the specified user.'
            }
            userExistsError.statusCode = 500
            reject(userExistsError)
          })
      }

      const missingFieldsError = new Error()
      missingFieldsError.statusCode = 400
      missingFieldsError.message = {
        response: 'Missing required field(s)'
      }
      reject(missingFieldsError)
    })
  }

  /**
   * Update token details
   *
   * @param {Object} data token details
   * @return {Promise} Promise
   */
  put (data) {
    const id = this._verifyInputFieldData(data.payload.id)

    const extend = this._verifyInputFieldData(data.payload.extend)

    return new Promise((resolve, reject) => {
      if (id && extend) {
        return _data.read('tokens', id)
          .then((tokenData) => {
            if (tokenData.expires > Date.now()) {
              tokenData.expires = Date.now() + 1000 * 60 * 60
              return _data.update('tokens', id, tokenData)
                .then(() => {
                  resolve({
                    statusCode: 200,
                    payload: {
                      response: 'Token successfully updated'
                    }
                  })
                })
                .catch(() => {
                  const updateTokenError = new Error()
                  updateTokenError.message = 'Could not update the token\'s expiration.'
                  updateTokenError.statusCode = 500
                })
            }
            const tokenExpiryError = new Error()
            tokenExpiryError.statusCode = 400
            tokenExpiryError.message = {
              response: 'The token has already expired, and cannot be extended.'
            }

            reject(tokenExpiryError)
          })
          .catch(() => {
            const userNotFoundError = new Error()
            userNotFoundError.message = {
              response: 'Specified user does not exist'
            }

            userNotFoundError.statusCode = 400
            reject(userNotFoundError)
          })
      }
      const missingFieldsError = new Error()

      missingFieldsError.message = {
        response: 'Missing required field'
      }

      missingFieldsError.statusCode = 400
      reject(missingFieldsError)
    })
  }

  /**
   * Remove a specified token from storage
   *
   * @param {Object} data Token details
   */
  delete (data) {
    const id = this._verifyInputFieldData(data.queryStringObject.id)
    return new Promise((resolve, reject) => {
      if (id) {
        return _data.read('tokens', id)
          .then(() => {
            _data.delete('tokens', id)
              .then(() => {
                resolve({
                  statusCode: 200,
                  payload: {
                    response: 'Token successfully deleted'
                  }
                })
              })
              .catch(() => {
                const deleteTokenError = new Error()
                deleteTokenError.statusCode = 500
                deleteTokenError.message = {
                  response: 'Could not delete specified token'
                }
                reject(deleteTokenError)
              })
          })
          .catch(() => {
            const userNotFoundError = new Error()
            userNotFoundError.statusCode = 400
            userNotFoundError.message = {
              response: 'Could not find the specified user'
            }
            reject(userNotFoundError)
          })
      }

      const missingFieldsError = new Error()
      missingFieldsError.statusCode = 400
      missingFieldsError.message = {
        response: 'Missing required field'
      }
      reject(missingFieldsError)
    })
  }

  verifyToken (id, phone) {
    return new Promise((resolve, reject) => {
      _data.read('tokens', id)
        .then((tokenData) => {
          if (tokenData.phone === phone &&
          tokenData.expires > Date.now()) {
            resolve(true)
          }
          reject(new Error(false))
        })
        .catch(() => reject(new Error(false)))
    })
  }
}

module.export = Token
