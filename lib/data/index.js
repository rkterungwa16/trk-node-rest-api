const fs = require('fs')
const path = require('path')

class DataStorageManger {
  constructor () {
    this.baseDir = path.join(__dirname, '/../../.data/')
  }

  /**
   * Write stringified data object into file
   *
   * @param {*} fileDescriptor
   * @param {Object} stringData a stringified object
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
   * Create a new file to write json data into
   *
   * @param {String} dirName
   * @param {String} fileName
   * @param {Object} data
   * @return {Promise}
   */
  _openFile (dirName, fileName, data) {
    return new Promise((resolve, reject) => {
      fs.open(`${this.baseDir}${dirName}/.json`, 'wx',
        (err, fileDescriptor) => {
          if (err) reject(new Error('Could not create new file, it may already exist'))
          const stringData = JSON.stringify(data)
          this._writeIntoFile(fileDescriptor, stringData)
            .then(value => resolve(value))
            .catch(err => reject(err))
        })
    })
  }

  /**
   * Create a new data entity and store
   *
   * @param {String} dirName name of created directory
   * @param {String} fileName name of json file to be created
   * @param {Object} data content of json file
   * @param {Function} callback function to handle success of failure of operation
   */
  create (dirName, fileName, data) {
    return new Promise((resolve, reject) => {
      this._openFile(dirName, fileName, data)
        .then(() => resolve(200))
        .catch(() => {
          const error = new Error()
          error.message = 'Could not create the new user'
          error.statusCode = 500
          reject(error)
        })
    })
  }

  read (dirName, fileName, callback) {}
}

module.exports = DataStorageManger
