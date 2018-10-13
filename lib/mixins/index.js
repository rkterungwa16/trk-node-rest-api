const mixin = Base => class extends Base {
  _verifyInputFieldData (fieldInfo) {
    if (super._verifyInputFieldData) {
      return super._verifyInputFieldData(fieldInfo)
    }
  }

  _verifyToken (id, phone) {
    if (super._verifyToken) {
      return super._verifyToken(id, phone)
    }
  }
}

module.exports = mixin
