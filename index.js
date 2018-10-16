const Server = require('./lib/server')
const server = new Server()

const app = {}

app.init = () => {
  server.init()
}

app.init()

module.exports = app
