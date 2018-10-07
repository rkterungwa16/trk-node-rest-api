const UserHandler = require('./userHandlers')

const user = new UserHandler()
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
handlers.notFound = (data, callback) => {
  callback(new Error(404))
}

// Users
handlers.users = (data) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete']
  return new Promise((resolve, reject) => {
    if (acceptableMethods.indexOf(data.method) > -1) {
      user[data.method](data)
    }

    reject(new Error(405))
  })
}
