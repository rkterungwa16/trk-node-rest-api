const handlers = require('../handlers')

const router = {
  'hello': handlers.hello,
  'users': handlers.users,
  'tokens': handlers.tokens,
  'checks': handlers.checks
}

module.exports = router
