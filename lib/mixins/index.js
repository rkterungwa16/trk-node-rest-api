const mixin = Base => class extends Base {
  _verifyInputFieldData (fieldInfo) {
    if (super._verifyInputFieldData) {
      return super._verifyInputFieldData(fieldInfo)
    }
  }
}

module.exports = mixin
