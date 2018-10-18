const Server = require('./lib/server')
const Workers = require('./lib/workers')

const workers = new Workers()
const server = new Server()

const app = {}

app.init = () => {
  server.init()

  workers.init()
}

app.init()

module.exports = app
