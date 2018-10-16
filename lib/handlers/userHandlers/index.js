const Data = require('../../data')
const helpers = require('../../helpers')
const Mixin = require('../../mixins')
const Validation = require('../../validation')

const _data = new Data()

class Users extends Mixin(Validation) {
  /**
   * Get user info with specified phone number
   *
   * @param {Object} data query string containing phone number
   *
   * @return {Promise} Promise
   */
  get (data) {
    const phone = typeof (data.queryStringObject.phone) === 'string' &&
    data.queryStringObject.phone.trim().length === 11
      ? data.queryStringObject.phone.trim() : false

    return new Promise((resolve, reject) => {
      if (phone) {
        const token = typeof (data.headers.token) === 'string' ? data.headers.token : false
        return this._verifyToken(token, phone)
          .then((userData) => {
            delete data.hashedPassword
            return _data.read('users', phone)
              .then(() => resolve({
                statusCode: 200,
                payload: userData
              }))
              .catch(() => {
                const userNotFoundError = new Error()
                userNotFoundError.message = {
                  response: 'User does not exist'
                }

                userNotFoundError.statusCode = 404
                reject(userNotFoundError)
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
    const firstName = this._verifyInputFieldData(data.payload.firstName)
    const lastName = this._verifyInputFieldData(data.payload.lastName)
    const phone = this._verifyInputFieldData(data.payload.phone)
    const password = this._verifyInputFieldData(data.payload.password)
    // const tosAgreement = this._verifyInputFieldData(data.payload.tosAgreement)
    // console.log('tos agreement', tosAgreement)
    return new Promise((resolve, reject) => {
      if (
        firstName &&
        lastName &&
        phone &&
        password
      ) {
        return _data.read('users', phone)
          .then((value, err) => {
            if (err) {
              const hashedPassword = helpers.hash(password)
              if (hashedPassword) {
                const userObject = {
                  firstName,
                  lastName,
                  phone,
                  hashedPassword,
                  tosAgreement: true
                }

                return _data.create('users', phone, userObject)
              }
              const hashError = new Error()
              hashError.message = 'Could not hash the user\'s password.'
              hashError.statusCode = 500
              return Promise.reject(hashError)
            }
            const userExistsError = new Error()
            userExistsError.message = {
              response: 'A user with that phone number already exists'
            }
            userExistsError.statusCode = 500
            return Promise.reject(userExistsError)
          })
          .then((userData) => {
            return resolve({
              statusCode: 200,
              payload: {
                response: 'User successfully created',
                data: userData.data
              }
            })
          })
          .catch((err) => {
            reject(err)
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
   * Update user details
   *
   * @param {Object} data user details
   * @return {Promise} Promise
   */
  put (data) {
    const phone = this._verifyInputFieldData(data.payload.phone)

    const firstName = this._verifyInputFieldData(data.payload.firstName)
    const lastName = this._verifyInputFieldData(data.payload.lastName)
    const password = this._verifyInputFieldData(data.payload.password)

    return new Promise((resolve, reject) => {
      if (phone) {
        if (firstName || lastName || password) {
          const token = typeof (data.headers.token) === 'string' ? data.headers.token : false
          return this._verifyToken(token, phone)
            .then(() => {
              return _data.read('users', phone)
                .then((userData) => {
                  if (firstName) {
                    userData.firstName = firstName
                  }

                  if (lastName) {
                    userData.lastName = lastName
                  }

                  if (password) {
                    userData.hashedPassword = helpers.hash(password)
                  }

                  _data.update('users', phone, userData)
                    .then(() => {
                      resolve({
                        statusCode: 200,
                        payload: {
                          response: 'User successfully updated'
                        }
                      })
                    })
                    .catch(() => {
                      const updateUserError = new Error()
                      updateUserError.message = 'Could not update the user'
                      updateUserError.statusCode = 500
                    })
                })
                .catch(() => {
                  const userNotFoundError = new Error()
                  userNotFoundError.message = {
                    response: 'Specified user does not exist'
                  }

                  userNotFoundError.statusCode = 400
                  reject(userNotFoundError)
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
   * Remove a specified user from storage
   *
   * @param {Object} data User details
   */
  delete (data) {
    const phone = this._verifyInputFieldData(data.payload.phone)
    return new Promise((resolve, reject) => {
      if (phone) {
        const token = typeof (data.headers.token) === 'string' ? data.headers.token : false
        return this._verifyToken(token, phone)
          .then(() => {
            return _data.read('users', phone)
              .then(() => {
                _data.delete('users', phone)
                  .then(() => {
                    resolve({
                      statusCode: 200,
                      payload: {
                        response: 'User successfully deleted'
                      }
                    })
                  })
                  .catch(() => {
                    const deleteUserError = new Error()
                    deleteUserError.statusCode = 500
                    deleteUserError.message = {
                      response: 'Could not delete specified user'
                    }
                    reject(deleteUserError)
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
          })
          .catch(() => {
            const missingTokenError = new Error()
            missingTokenError.message = {
              response: 'Missing required token in header, or token is invalid'
            }

            missingTokenError.statusCode = 403
            reject(missingTokenError)
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
}

module.exports = Users
