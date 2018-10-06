const fs = require('fs')
const path = require('path')
const helpers = require('../helpers')

class DataStorageManger {
  constructor () {
    this.baseDir = path.join(__dirname, '/../../.data/')
  }

  /**
   * Write stringified data object into file
   *
   * @param {*} fileDescriptor
   * @param {Object} stringData a stringified object
   *
   * @return {Promise} Promise
   */
  _writeIntoFile (fileDescriptor, stringData) {
    return new Promise((resolve, reject) => {
      fs.writeFile(fileDescriptor, stringData, (err) => {
        if (err) reject(new Error('Error writing to new file'))
        fs.close(fileDescriptor, (err) => {
          if (!err) resolve(false)
          reject(new Error('Error closing new File'))
        })
      })
    })
  }

  /**
   * Modify the contents of file
   *
   * @param {*} fileDescriptor open file numeric identifier
   * @param {String} stringData
   */
  _truncateFileContent (fileDescriptor, stringData) {
    return new Promise((resolve, reject) => {
      fs.truncate(fileDescriptor, (err) => {
        if (err) reject(new Error('Error truncating file'))
        resolve({ fileDescriptor, stringData })
      })
    })
  }

  /**
   * Create a new file to write json data into
   *
   * @param {String} dirName
   * @param {String} fileName
   * @param {String} flag
   * @param {Object} data
   *
   * @return {Promise}
   */
  _openFile (dirName, fileName, data, flag) {
    return new Promise((resolve, reject) => {
      fs.open(`${this.baseDir}${dirName}/${fileName}.json`, flag,
        (err, fileDescriptor) => {
          if (err) reject(new Error('Could not create new file, it may already exist'))
          const stringData = JSON.stringify(data)
          resolve({
            fileDescriptor, stringData
          })
        })
    })
  }

  /**
   * Read content of specified file
   *
   * @param {String} dirName Name of directory containing file
   * @param {String} fileName Name of file containing data
   *
   * @return {Promise} Promise
   */
  _readFile (dirName, fileName) {
    return new Promise((resolve, reject) => {
      fs.readFile(`${this.baseDir}${dirName}/.json`, 'utf8',
        (err, data) => {
          if (err) reject(new Error(err))
          const parsedData = helpers.parseJsonToObject(data)
          resolve(parsedData)
        })
    })
  }

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
      this._openFile(dirName, fileName, data)
        .then((data) => {
          this._writeIntoFile(data.fileDescriptor, data.stringData, 'wx')
            .then(() => resolve(data.fileDescriptor))
            .catch(err => reject(err))
        })
        .catch(() => {
          const error = new Error()
          error.message = 'Could not create the new user'
          error.statusCode = 500
          reject(error)
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
        .then((data) => resolve(data))
        .catch((err) => reject(err))
    })
  }

  update (dirName, fileName, data) {
    return new Promise((resolve, reject) => {
      this._openFile(dirName, fileName, data, 'r+')
        .then((data) => {
          this._truncateFileContent(data.fileDescriptor, data.stringData)
            .then((truncateData) => {
              this._writeIntoFile(truncateData.fileDescriptor, truncateData.stringData)
                .then(value => value)
                .catch(err => err)
            })
            .catch((err) => reject(err))
        })
        .catch(() => {
          const error = new Error()
          error.message = 'Could not open file for updating, it may not exist yet'
          error.statusCode = 500
          reject(error)
        })
    })
  }
}

module.exports = DataStorageManger
