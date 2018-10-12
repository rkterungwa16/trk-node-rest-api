class Validation {
  /**
   *
   * @param {String|Boolean} fieldInfo
   */
  _verifyInputFieldData (fieldInfo) {
    if (typeof fieldInfo === 'string') {
      return typeof (fieldInfo) ===
    'string' && fieldInfo.trim().length > 0
        ? fieldInfo.trim() : false
    }
    return !!(typeof (fieldInfo.payload.extend) === 'boolean' &&
    fieldInfo.payload.extend === true)
  }
}

module.exports = Validation
