const UserHandler = require('./userHandlers')
const TokenHandler = require('./tokenHandlers')

const user = new UserHandler()
const token = new TokenHandler()
const handlers = {}

// Hello
handlers.hello = (data) => {
  return new Promise((resolve, reject) => {
    if (data) {
      resolve({
        statusCode: 200,
        data,
        payload: {
          response: 'Hello, how are you doing? Welcome to Nodejs Master class'
        }
      })
    }

    reject(new Error(406))
  })
}

// Not-Found
handlers.notFound = function () {
  return new Error(404)
}

/**
 * Map incoming user requests methods
 * to appropriate function
 * @param {Object} data user data
 */
handlers.users = (data) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete']
  return new Promise((resolve, reject) => {
    if (acceptableMethods.indexOf(data.method) > -1) {
      // Resolve with results from crud methods
      return user[data.method](data)
        .then((data) => {
          resolve(data)
        })
        .catch(err => reject(err))
    }

    const userMethodError = new Error()
    userMethodError.statusCode = 405
    userMethodError.message = { response: 'Method not allowed' }
    reject(userMethodError)
  })
}

/**
 * Map incoming token requests methods
 * to appropriate function
 * @param {Object} data token data
 */
handlers.tokens = (data) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete']
  return new Promise((resolve, reject) => {
    if (acceptableMethods.indexOf(data.method) > -1) {
      // Resolve with results from crud methods
      return token[data.method](data)
        .then((data) => {
          resolve(data)
        })
        .catch(err => reject(err))
    }

    const userMethodError = new Error()
    userMethodError.statusCode = 405
    userMethodError.message = { response: 'Method not allowed' }
    reject(userMethodError)
  })
}

module.exports = handlers
