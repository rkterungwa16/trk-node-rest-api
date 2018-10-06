const UserHandler = require('./userHandlers')

const user = new UserHandler()
const handlers = {}

// Ping
handlers.ping = (data, callback) => {
  callback(null, 200)
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
