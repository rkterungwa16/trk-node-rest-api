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
        _data.read('users', phone)
          .then(() => resolve({
            statusCode: 200,
            data
          }))
          .catch(() => reject(new Error(404)))
      }
      const error = new Error()
      error.message = 'Missing required field'
      error.statusCode = 404
      reject(error)
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
        console.log('value')
        _data.read('users', phone)
          .then((value) => {
            const userExistsError = new Error()
            userExistsError.message = 'A user with that phone number already exists'
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

                _data.create('users', phone, userObject)
                  .then(() => 200)
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
}

module.exports = Users
