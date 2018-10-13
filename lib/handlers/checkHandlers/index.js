const Data = require('../../data')
const helpers = require('../../helpers')
const config = require('../../../config')
const Mixin = require('../../mixins')
const Validation = require('../../validation')

const _data = new Data()

class Checks extends Mixin(Validation) {
  /**
   * Get user info with specified phone number
   *
   * @param {Object} data query string containing phone number
   *
   * @return {Promise} Promise
   */
  get (data) {
    const id = typeof (data.queryStringObject.id) === 'string' &&
    data.queryStringObject.id.trim().length === 20
      ? data.queryStringObject.id.trim() : false

    const token = typeof (data.headers.token) === 'string' ? data.headers.token : false

    return new Promise((resolve, reject) => {
      if (id) {
        return _data.read('checks', id)
          .then((checkData) => {
            return this._verifyToken(token, checkData.userPhone)
              .then(() => {
                resolve({
                  statusCode: 200,
                  payload: checkData
                })
              })
              .catch(() => {
                const missingTokenError = new Error()
                missingTokenError.message = {
                  response: 'Missing required token in header, or token is invalid'
                }

                missingTokenError.statusCode = 403
                reject(missingTokenError)
              })
          })
          .catch(() => {
            const userNotFoundError = new Error()
            userNotFoundError.message = {
              response: 'User does not exist'
            }

            userNotFoundError.statusCode = 404
            reject(userNotFoundError)
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
   * Create a new user
   * @param {Object} data
   */
  post (data) {
    const protocol = typeof (data.payload.protocol) === 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false
    const url = typeof (data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false
    const method = typeof (data.payload.method) === 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false
    const successCodes = typeof (data.payload.successCodes) === 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false
    const timeoutSeconds = typeof (data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false

    const token = typeof (data.headers.token) === 'string' ? data.headers.token : false
    return new Promise((resolve, reject) => {
      if (
        protocol &&
        url &&
        method &&
        successCodes &&
        timeoutSeconds
      ) {
        return _data.read('tokens', token)
          .then((tokenData) => {
            _data.read('users', tokenData.phone)
              .then((userData) => {
                const userPhone = tokenData.phone
                const userChecks = typeof (userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : []

                if (userChecks.length < config.maxChecks) {
                  const checkId = helpers.createRandomString(20)

                  const checkObject = {
                    id: checkId,
                    userPhone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeoutSeconds
                  }

                  return _data.create('checks', checkId, checkObject)
                    .then(() => {
                      userData.checks = userChecks
                      userData.checks.push(checkId)

                      _data.update('users', userPhone, userData)
                        .then(() => {
                          resolve({
                            statusCode: 200,
                            payload: checkObject
                          })
                        })
                        .catch(() => {
                          const updateUserError = new Error()
                          updateUserError.message = 'Could not update the user with the new check.'
                          updateUserError.statusCode = 500
                          reject(updateUserError)
                        })
                    })
                    .catch(() => {
                      const createCheckError = new Error()
                      createCheckError.message = 'Could not create the new check'
                      createCheckError.statusCode = 500
                      reject(createCheckError)
                    })
                }

                const maxNumberOfChecksError = new Error()
                maxNumberOfChecksError.statusCode = 400
                maxNumberOfChecksError.message = `The user already has the maximum number of checks (${config.maxChecks}).`

                reject(maxNumberOfChecksError)
              })
          })
          .catch(() => {
            const tokenExistsError = new Error()
            tokenExistsError.message = {
              response: 'Token does not exist'
            }
            tokenExistsError.statusCode = 403
            reject(tokenExistsError)
          })
      }

      const missingFieldsError = new Error()
      missingFieldsError.statusCode = 400
      missingFieldsError.message = {
        response: 'Missing required fields'
      }
      reject(missingFieldsError)
    })
  }

  /**
   * Update check details
   *
   * @param {Object} data check details
   * @return {Promise} Promise
   */
  put (data) {
    // Check for required field
    const id = typeof (data.payload.id) === 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false

    // Check for optional fields
    const protocol = typeof (data.payload.protocol) === 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false
    const url = typeof (data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false
    const method = typeof (data.payload.method) === 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false
    const successCodes = typeof (data.payload.successCodes) === 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false
    const timeoutSeconds = typeof (data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false

    return new Promise((resolve, reject) => {
      if (id) {
        if (protocol ||
          url ||
          method ||
          successCodes ||
          timeoutSeconds) {
          const token = typeof (data.headers.token) === 'string' ? data.headers.token : false
          _data.read('checks', id)
            .then((checkData) => {
              return this._verifyToken(token, id)
                .then(() => {
                  return _data.read('users', id)
                    .then((userData) => {
                      // Update check data where necessary
                      if (protocol) {
                        checkData.protocol = protocol
                      }
                      if (url) {
                        checkData.url = url
                      }
                      if (method) {
                        checkData.method = method
                      }
                      if (successCodes) {
                        checkData.successCodes = successCodes
                      }
                      if (timeoutSeconds) {
                        checkData.timeoutSeconds = timeoutSeconds
                      }
                      _data.update('checks', id, checkData)
                        .then(() => {
                          resolve({
                            statusCode: 200,
                            payload: {
                              response: 'Checks successfully updated'
                            }
                          })
                        })
                        .catch(() => {
                          const updateChecksError = new Error()
                          updateChecksError.message = 'Could not update the check.'
                          updateChecksError.statusCode = 500
                        })
                    })
                    .catch(() => {
                      const checkNotFoundError = new Error()
                      checkNotFoundError.message = {
                        response: 'Specified check does not exist'
                      }

                      checkNotFoundError.statusCode = 400
                      reject(checkNotFoundError)
                    })
                })
                .catch(() => {
                  const missingTokenError = new Error()
                  missingTokenError.message = {
                    response: 'Missing required token in header, or token is invalid'
                  }

                  missingTokenError.statusCode = 403
                  reject(missingTokenError)
                })
            })
        }
        const missingOptionFieldsError = new Error()
        missingOptionFieldsError.message = {
          response: 'Missing fields to update'
        }

        missingOptionFieldsError.statusCode = 400
        reject(missingOptionFieldsError)
      } else {
        const missingFieldsError = new Error()

        missingFieldsError.message = {
          response: 'Missing required field'
        }

        missingFieldsError.statusCode = 400
        reject(missingFieldsError)
      }
    })
  }

  /**
   * Remove a specified check from storage
   *
   * @param {Object} data Check details
   */
  delete (data) {
    // Check that id is valid
    const id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false

    return new Promise((resolve, reject) => {
      if (id) {
        const token = typeof (data.headers.token) === 'string' ? data.headers.token : false
        _data.read('checks', id)
          .then((checkData) => {
            return this._verifyToken(token, checkData.phone)
              .then(() => {
                _data.delete('checks', id)
                  .then(() => {
                    _data.read('users', checkData.userPhone)
                      .then((userData) => {
                        const userChecks = typeof (userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : []

                        const checkPosition = userChecks.indexOf(id)

                        if (checkPosition > -1) {
                          userChecks.splice(checkPosition, 1)

                          return _data.update('users', checkData.userPhone, userData)
                            .then(() => {
                              resolve({
                                statusCode: 200,
                                payload: {
                                  response: 'Check successfully updated'
                                }
                              })
                            })
                            .catch(() => {
                              const checkUpdateError = new Error()
                              checkUpdateError.message = 'Could not update the user.'
                              checkUpdateError.statusCode = 500
                            })
                        }

                        const couldNotFindCheckError = new Error()
                        couldNotFindCheckError.message = 'Could not find the check on the user\'s object, so could not remove it.'
                        couldNotFindCheckError.statusCode = 500

                        reject(couldNotFindCheckError)
                      })
                      .catch(() => {
                        const checkCreatorExistError = new Error()
                        checkCreatorExistError.message = 'Could not find the user who created the check, so could not remove the check from the list of checks on their user object.'
                        checkCreatorExistError.statusCode = 500
                      })
                  })
                  .catch(() => {
                    const deleteCheckError = new Error()
                    deleteCheckError.statusCode = 500
                    deleteCheckError.message = {
                      response: 'Could not delete check data'
                    }
                    reject(deleteCheckError)
                  })
              })
              .catch(() => {
                const missingTokenError = new Error()
                missingTokenError.message = {
                  response: 'Missing required token in header, or token is invalid'
                }

                missingTokenError.statusCode = 403
                reject(missingTokenError)
              })
          })
          .catch(() => {
            const checkDoesNotExistError = new Error()
            checkDoesNotExistError.message = 'The check ID specified could not be found'
            checkDoesNotExistError.statusCode = 400
          })
      }

      const missingFieldsError = new Error()
      missingFieldsError.statusCode = 400
      missingFieldsError.message = {
        response: 'Missing valid id'
      }
      reject(missingFieldsError)
    })
  }
}

module.exports = Checks
