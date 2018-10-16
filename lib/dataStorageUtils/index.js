const fs = require('fs')
const path = require('path')
const helpers = require('../helpers')

class DataStorageUtils {
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
        if (err) {
          const writingIntoFileError = new Error()
          writingIntoFileError.message = {
            response: 'Error writing to new file'
          }

          writingIntoFileError.statusCode = 500
        }
        fs.close(fileDescriptor, (err) => {
          if (!err) {
            resolve({
              statusCode: 200,
              payload: {
                response: 'Successfully written into file',
                data: stringData
              }
            })
          }
          const closingFileError = new Error()
          closingFileError.message = {
            response: 'Error closing new File'
          }

          closingFileError.statusCode = 500
          reject(closingFileError)
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
        if (err) {
          const truncateFileError = new Error()
          truncateFileError.message = {
            response: 'Error truncating file'
          }
          truncateFileError.statusCode = 500
          return reject(truncateFileError)
        }
        resolve({ fileDescriptor, stringData })
      })
    })
  }

  /**
   * Read contents of a director
   * @param {Path} dirPath full path to dir
   * @return {Promise} Promise
   */
  _readDirectory (dirPath) {
    return new Promise((resolve, reject) => {
      fs.readdir(dirPath, (err, data) => {
        if (!err && data && data.length > 0) {
          const trimmedFileNames = []
          data.forEach((fileName) => {
            trimmedFileNames.push(fileName.replace('.json', ''))
          })
          return resolve(trimmedFileNames)
        }
        const readDirError = new Error()
        readDirError.message = err
        readDirError.data = data
        return reject(readDirError)
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
          if (err) {
            const fileAlreadyExistsError = new Error()
            fileAlreadyExistsError.message = {
              response: 'Could not create new file, it may already exist'
            }
            fileAlreadyExistsError.statusCode = 500
            return reject(fileAlreadyExistsError)
          }
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
      fs.readFile(`${this.baseDir}${dirName}/${fileName}.json`, 'utf8',
        (err, data) => {
          if (!err && data) {
            const parsedData = helpers.parseJsonToObject(data)
            resolve(parsedData)
          }
          reject(new Error(err))
        })
    })
  }
}

module.exports = DataStorageUtils
