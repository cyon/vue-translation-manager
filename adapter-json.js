const fs = require('fs')
const path = require('path')
const set = require('lodash.set')
const get = require('lodash.get')
const unset = require('lodash.unset')

const readFile = function (filePath, opts) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, opts, (err, contents) => {
      if (err) return reject(err)
      resolve(contents)
    })
  })
}

const writeFile = function (filePath, contents) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, contents, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

function JSONAdapter (opts) {
  this.path = opts.path
  if (!this.path) throw new Error('No path given')
  var stat = fs.statSync(this.path)
  this.multifile = stat.isDirectory()
  this.translationFiles = null
  if (this.multifile && opts.fileMapping) {
    this.translationFiles = opts.fileMapping
  }

  this.insertLeaf = opts.leaf || false
  this.languages = null
}

JSONAdapter.prototype._setLanguages = function (languages) {
  this.languages = languages

  if (this.multifile && this.translationFiles) {
    this.languages.map((lang) => {
      if (!this.translationFiles[lang]) throw new Error(`No translation file for language "${lang}" specified`)
      let translationFilePath = path.join(this.path, this.translationFiles[lang])
      if (!fs.existsSync(translationFilePath)) throw new Error(`Translation file not found: ${translationFilePath}`)
    })
  } else if (this.multifile) {
    this.translationFiles = {}
    this.languages.map((lang) => {
      let translationFilePath = path.join(this.path, `${lang}.json`)
      if (!fs.existsSync(translationFilePath)) throw new Error(`Translation file not found: ${translationFilePath}`)

      this.translationFiles[lang] = translationFilePath
    })
  }
}

JSONAdapter.prototype.addTranslations = async function (key, translations) {
  if (this.multifile) {
    var promises = Object.keys(translations).map((lang) => {
      let filePath = path.join(this.path, this.translationFiles[lang])
      return readFile(filePath, { encoding: 'utf8' }).then((contents) => {
        if (contents.trim() === '') contents = '{}'
        let obj = JSON.parse(contents)
        set(obj, key, translations[lang])
        return writeFile(filePath, JSON.stringify(obj, null, 2) + '\n')
      })
    })
    return Promise.all(promises)
  } else {
    let contents = await readFile(this.path, { encoding: 'utf8' })
    if (contents.trim() === '') contents = '{}'
    let obj = JSON.parse(contents)

    Object.keys(translations).map((lang) => {
      let insertKey = null
      if (this.insertLeaf) {
        insertKey = `${key}.${lang}`
      } else {
        insertKey = `${lang}.${key}`
      }

      set(obj, insertKey, translations[lang])
    })

    await writeFile(this.path, JSON.stringify(obj, null, 2) + '\n')
  }
}

JSONAdapter.prototype.getTranslations = async function (key) {
  let translations = {}
  if (this.multifile) {
    var promises = this.languages.map((lang) => {
      let filePath = path.join(this.path, this.translationFiles[lang])
      return readFile(filePath, { encoding: 'utf8' }).then((contents) => {
        if (contents.trim() === '') {
          translations[lang] = null
          return
        }

        let obj = JSON.parse(contents)
        translations[lang] = get(obj, key, null)
      })
    })
    await Promise.all(promises)
    return translations
  }

  let contents = await readFile(this.path, { encoding: 'utf8' })
  if (contents.trim() === '') return {}

  let obj = JSON.parse(contents)

  this.languages.map((lang) => {
    let retrievalKey = null
    if (this.insertLeaf) {
      retrievalKey = `${key}.${lang}`
    } else {
      retrievalKey = `${lang}.${key}`
    }
    translations[lang] = get(obj, retrievalKey, null)
  })

  return translations
}

JSONAdapter.prototype.getAllKeys = async function () {
  let translations = {}

  if (this.multifile) {
    var promises = this.languages.map((lang) => {
      let filePath = path.join(this.path, this.translationFiles[lang])
      return readFile(filePath, { encoding: 'utf8' }).then((contents) => {
        if (contents.trim() === '') {
          translations[lang] = []
          return
        }
        let obj = JSON.parse(contents)
        translations[lang] = Object.keys(flattenObject(obj))
      })
    })
    await Promise.all(promises)
    return translations
  }

  let contents = await readFile(this.path, { encoding: 'utf8' })
  let obj = JSON.parse(contents)

  if (this.insertLeaf) {
    let flattenedKeys = Object.keys(flattenObject(obj))
    flattenedKeys.map((key) => {
      let parts = key.split('.')
      let lang = parts.pop()
      if (!this.languages.includes(lang)) return
      if (!translations[lang]) translations[lang] = []
      translations[lang].push(parts.join('.'))
    })
  } else {
    this.languages.map((lang) => {
      if (!obj[lang]) {
        translations[lang] = []
        return
      }
      translations[lang] = Object.keys(flattenObject(obj[lang]))
    })
  }

  return translations
}

JSONAdapter.prototype.deleteTranslations = async function (keys) {
  if (this.multifile) {
    var promises = this.languages.map((lang) => {
      let filePath = path.join(this.path, this.translationFiles[lang])
      return readFile(filePath, { encoding: 'utf8' }).then((contents) => {
        let obj = JSON.parse(contents)
        keys.map((key) => {
          unset(obj, key)

          let keyParts = key.split('.')
          for (var i = keyParts.length - 1; i >= 1; i--) {
            var cnKey = keyParts.slice(0, i).join('.')
            var val = get(obj, cnKey)
            if (!val || !Object.keys(val).length) {
              unset(obj, cnKey)
            }
          }
        })
        return writeFile(filePath, JSON.stringify(obj, null, 2) + '\n')
      })
    })
    return Promise.all(promises)
  }

  let contents = await readFile(this.path, { encoding: 'utf8' })
  let obj = JSON.parse(contents)

  keys.map((key) => {
    this.languages.map((lang) => {
      let keyToDelete = (this.insertLeaf ? `${key}.${lang}` : `${lang}.${key}`)
      unset(obj, keyToDelete)

      let keyParts = keyToDelete.split('.')
      for (var i = keyParts.length - 1; i >= 1; i--) {
        var cnKey = keyParts.slice(0, i).join('.')
        var val = get(obj, cnKey)
        if (!val || !Object.keys(val).length) {
          unset(obj, cnKey)
        }
      }
    })
  })

  return writeFile(this.path, JSON.stringify(obj, null, 2) + '\n')
}

module.exports = JSONAdapter

function flattenObject (ob) {
  var toReturn = {}
  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue
    if ((typeof ob[i]) === 'object') {
      var flatObject = flattenObject(ob[i])
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue
        toReturn[`${i}.${x}`] = flatObject[x]
      }
    } else {
      toReturn[i] = ob[i]
    }
  }
  return toReturn
}
