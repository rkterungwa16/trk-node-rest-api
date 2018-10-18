const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

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

          reject(writingIntoFileError)
        }
        fs.close(fileDescriptor, (err) => {
          if (!err) {
            resolve(true)
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
   * Append content to file
   * @param {*} fileDescriptor
   * @param {String} str
   *
   * @return {Object} Promise
   */
  _appendToFile (fileDescriptor, str) {
    return new Promise((resolve, reject) => {
      fs.appendFile(fileDescriptor, `${str}\n`, (err) => {
        if (!err) {
          return fs.close(fileDescriptor, (err) => {
            if (!err) {
              return resolve(fileDescriptor)
            }
            const closeAppendedFileError = new Error()
            closeAppendedFileError.message = {
              response: 'Error closing file that was being appended'
            }

            return reject(closeAppendedFileError)
          })
        }
        const appendFileError = new Error()
        appendFileError.message = 'Could not open file for appending'
      })
    })
  }

  /**
   * Modify the contents of file
   *
   * @param {*} fileDescriptor open file numeric identifier
   * @param {String} stringData
   *
   * @return {Object} Promise
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
   * @param {String} dirPath full path to dir
   * @param {*} includeCompressedLogs include the compressed logs
   * @return {Promise} Promise
   */
  _readDirectory (dirPath, includeCompressedLogs) {
    return new Promise((resolve, reject) => {
      fs.readdir(dirPath, (err, data) => {
        if (!err && data && data.length > 0) {
          let trimmedFileNames = []
          data.forEach((fileName) => {
            if (fileName.indexOf('.json') > -1) {
              trimmedFileNames.push(fileName.replace('.json', ''))
            }

            if (fileName.indexOf('.log') > -1) {
              trimmedFileNames.push(fileName.replace('.log', ''))
            }

            if (fileName.indexOf('.gz.b64') > -1 &&
            includeCompressedLogs) {
              trimmedFileNames.push(fileName.replace('.gz.b64', ''))
            }
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
          resolve({
            fileDescriptor,
            fileData: data
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
        (err, stringifiedData) => {
          if (!err && stringifiedData) {
            resolve(stringifiedData)
          }
          reject(new Error(err))
        })
    })
  }

  /**
   * Compress data using gzip
   *
   * @param {*} inputString
   */
  _gzipCompress (inputString) {
    return new Promise((resolve, reject) => {
      zlib.gzip(inputString, (err, buffer) => {
        if (!err && buffer) return resolve(buffer)
        return reject(err)
      })
    })
  }

  _unZip (inputBuffer) {
    return new Promise((resolve, reject) => {
      zlib.unzip(inputBuffer, (err, outputBuffer) => {
        if (!err && outputBuffer) {
          const str = outputBuffer.toString()
          return resolve(str)
        }
        return reject(err)
      })
    })
  }
}

module.exports = DataStorageUtils
