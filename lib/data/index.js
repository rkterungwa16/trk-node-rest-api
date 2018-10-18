const fs = require('fs')
const DataStorageUtils = require('../dataStorageUtils')
const helpers = require('../helpers')

class DataStorageManager extends DataStorageUtils {
  /**
   * Create a new data entity and store
   *
   * @param {String} dirName name of directory containing created data entry
   * @param {String} fileName name of file containing created data entry
   * @param {Object} data content to be created in json file
   *
   * @return {Promise} Promise
   */
  create (dirName, fileName, data) {
    return new Promise((resolve, reject) => {
      this._openFile(dirName, fileName, data, 'wx')
        .then((data) => {
          const stringData = JSON.stringify(data.fileData)
          return this._writeIntoFile(data.fileDescriptor, stringData, 'wx')
        })
        .then((createdData) => {
          return resolve(createdData)
        })
        .catch((err) => {
          if (err) {
            const error = new Error()
            error.message = {
              response: `Could not create the new ${dirName}`
            }
            error.statusCode = 500
            reject(error)
          }
        })
    })
  }

  /**
   * Get content of created data entry
   *
   * @param {String} dirName
   * @param {String} fileName
   *
   * @return {Promise} Promise
   */
  read (dirName, fileName) {
    return new Promise((resolve, reject) => {
      this._readFile(dirName, fileName)
        .then((stringifiedData) => {
          const parsedData = helpers.parseJsonToObject(stringifiedData)
          resolve(parsedData)
        })
        .catch(() => {
          const dataDoesNotExistError = new Error()
          dataDoesNotExistError.message = {
            response: `Could not find the specified ${dirName}.`
          }
          dataDoesNotExistError.statusCode = 500
          reject(dataDoesNotExistError)
        })
    })
  }

  /**
   *
   * @param {*} dirName
   * @param {*} fileName
   * @param {*} data
   *
   * @return {Promise} Promise
   */
  update (dirName, fileName, data) {
    return new Promise((resolve, reject) => {
      this._openFile(dirName, fileName, data, 'r+')
        .then((data) => {
          const stringData = JSON.stringify(data.fileData)
          return this._truncateFileContent(data.fileDescriptor, stringData)
        })
        .then((truncateData) => {
          return this._writeIntoFile(truncateData.fileDescriptor, truncateData.stringData)
        })
        .then(value => resolve(value))
        .catch(() => {
          const updateTokenError = new Error()
          updateTokenError.message = 'Could not update the token\'s expiration.'
          updateTokenError.statusCode = 500
          reject(updateTokenError)
        })
    })
  }

  /**
   * Delete a file
   * @param {String} dirName
   * @param {String} fileName
   *
   * @param {Promise} Promise
   */
  delete (dirName, fileName) {
    return new Promise((resolve, reject) => {
      fs.unlink(`${this.baseDir}${dirName}/${fileName}.json`, (err) => {
        if (err) {
          const deleteUserError = new Error()
          deleteUserError.statusCode = 500
          deleteUserError.message = {
            response: 'Could not delete specified user'
          }
          return reject(deleteUserError)
        }

        return resolve(true)
      })
    })
  }

  /**
   * Get list of all items in directory
   * @param {String} dirName
   * @return {Promise} promise
   */
  list (dirName) {
    return new Promise((resolve, reject) => {
      this._readDirectory(`${this.baseDir}${dirName}/`)
        .then((dirValues) => {
          resolve(dirValues)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
}

module.exports = DataStorageManager
