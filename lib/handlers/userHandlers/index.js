const Data = require('../../data')
const helpers = require('../../helpers')

const _data = new Data()
class Users {
  /**
   * Get user info with specified phone number
   *
   * @param {Object} data query string containing phone number
   *
   * @return {Promise} Promise
   */
  get (data) {
    const phone = typeof (data.queryStringObject.phone) === 'string' &&
    data.queryStringObject.phone.trim().length === 10
      ? data.queryStringObject.phone.trim() : false

    return new Promise((resolve, reject) => {
      if (phone) {
        delete data.hashedPassword
        return _data.read('users', phone)
          .then(() => resolve({
            statusCode: 200,
            data
          }))
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
   *
   * @param {String} fieldInfo
   */
  _verifyInputFieldData (fieldInfo) {
    return typeof (fieldInfo) ===
    'string' && fieldInfo.trim().length > 0
      ? fieldInfo.trim() : false
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
    const tosAgreement = this._verifyInputFieldData(data.payload.tosAgreement)

    return new Promise((resolve, reject) => {
      if (
        firstName &&
        lastName &&
        phone &&
        password &&
        tosAgreement
      ) {
        return _data.read('users', phone)
          .then((value) => {
            const userExistsError = new Error()
            userExistsError.message = {
              response: 'A user with that phone number already exists'
            }
            userExistsError.statusCode = 500
            reject(userExistsError)
          })
          .catch((err) => {
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
                  .then(() => {
                    resolve({
                      statusCode: 200,
                      payload: {
                        response: 'User successfully created'
                      }
                    })
                  })
                  .catch(() => {
                    const userError = new Error()
                    userError.message = 'Could not create the new user'
                    userError.statusCode = 500
                    reject(userError)
                  })
              }
              const hashError = new Error()
              hashError.message = 'Could not hash the user\'s password.'
              hashError.statusCode = 500
              reject(hashError)
            }
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
   * Update users details
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
}

module.exports = Users
