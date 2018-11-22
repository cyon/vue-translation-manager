const fs = require('fs')
const path = require('path')
const test = require('tape')
const { cleanupTmp } = require('./utils')
const Manager = require('../')
const { JSONAdapter } = require('../')

test('correct initialization', function (t) {
  let messagesFile = path.join(__dirname, 'tmp/messages.json')
  fs.writeFileSync(path.join(__dirname, 'tmp/messages.json'), '{}')

  var m = new Manager({
    languages: ['en'],
    path: '/tmp',
    adapter: new JSONAdapter({ path: messagesFile })
  })
  t.ok(m, 'initialized manager is not null')
  t.equal(typeof m.getStringsForComponent, 'function')

  t.throws(() => {
    // eslint-disable-next-line
    new Manager({})
  }, 'throws when no opts are given')

  t.throws(() => {
    // eslint-disable-next-line
    new Manager({ languages: [] })
  }, 'throws when no path is given')

  cleanupTmp()
  t.end()
})

test('getTemplateForSingleComponents', function (t) {
  let messagesFile = path.join(__dirname, 'tmp/messages.json')
  fs.writeFileSync(path.join(__dirname, 'tmp/messages.json'), '{}')
  var m = new Manager({
    languages: ['en'],
    path: '/tmp',
    adapter: new JSONAdapter({ path: messagesFile })
  })

  var pathToFile = path.join(__dirname, 'data/test-1/src/components/Test.vue')
  var templateResult = m.getTemplateForSingleFileComponent(pathToFile)
  t.ok(templateResult, 'function returned something')
  t.ok(templateResult.template, 'template present')
  t.equal(templateResult.offset, 10, 'offset is exact')

  cleanupTmp()
  t.end()
})

test('getSuggestedKey', async function (t) {
  let messagesFile = path.join(__dirname, 'tmp/messages.json')
  fs.writeFileSync(path.join(__dirname, 'tmp/messages.json'), '{}')
  var rootPath = path.join(__dirname, 'data/test-1')
  var m = new Manager({
    languages: ['en'],
    path: '/tmp',
    adapter: new JSONAdapter({ path: messagesFile }),
    root: rootPath
  })
  var pathToFile = path.join(__dirname, 'data/test-1/src/components/Test.vue')
  var key = await m.getSuggestedKey(pathToFile, 'Create Group')
  t.equal(key, 'test.createGroup', 'key is correct')

  var pathToFile2 = path.join(__dirname, 'data/test-1/src/components/header/Titlebar.vue')
  var key2 = await m.getSuggestedKey(pathToFile2, 'Little text here with a lot of words that hopefully won\'t appear in the key')
  t.equal(key2, 'header.titlebar.littleTextHere', 'key is correct')

  cleanupTmp()
  t.end()
})

test('getSuggestedKey with list of used keys', async function (t) {
  let messagesFile = path.join(__dirname, 'tmp/messages.json')
  fs.writeFileSync(path.join(__dirname, 'tmp/messages.json'), '{}')
  var rootPath = path.join(__dirname, 'data/test-1')
  var m = new Manager({
    languages: ['en'],
    path: '/tmp',
    adapter: new JSONAdapter({ path: messagesFile }),
    root: rootPath
  })
  var pathToFile = path.join(__dirname, 'data/test-1/src/components/Test.vue')
  var key = await m.getSuggestedKey(pathToFile, 'Create Group and a lot of text that stays the same One')
  t.equal(key, 'test.createGroupAnd', 'key is correct')

  var keyTwo = await m.getSuggestedKey(pathToFile, 'Create Group and a lot of text that stays the same Two')
  t.equal(keyTwo, 'test.createGroupAnd', 'key is correct')

  var keyThree = await m.getSuggestedKey(pathToFile, 'Create Group and a lot of text that stays the same Three', ['test.createGroupAnd'])
  t.equal(keyThree, 'test.createGroupAnd1', 'key is correct')

  cleanupTmp()
  t.end()
})

test('getStringsForComponent', function (t) {
  let messagesFile = path.join(__dirname, 'tmp/messages.json')
  fs.writeFileSync(path.join(__dirname, 'tmp/messages.json'), '{}')
  var m = new Manager({
    languages: ['en'],
    path: '/tmp',
    adapter: new JSONAdapter({ path: messagesFile })
  })

  var pathToFile = path.join(__dirname, 'data/test-1/src/components/Test.vue')
  var strings = m.getStringsForComponent(pathToFile)
  t.ok(strings, 'there is a result')
  t.equal(strings.length, 5, 'there are five strings in the file')
  t.equal(strings[0].indexInTemplate, 17, 'indexInTemplate is correct')
  t.equal(strings[0].indexInFile, 27, 'indexInFile is correct')
  t.ok(strings[0].string, 'string is given')

  cleanupTmp()
  t.end()
})

test('getStringsForComponent with special characters', function (t) {
  let messagesFile = path.join(__dirname, 'tmp/messages.json')
  fs.writeFileSync(path.join(__dirname, 'tmp/messages.json'), '{}')
  var m = new Manager({
    languages: ['en'],
    path: '/tmp',
    adapter: new JSONAdapter({ path: messagesFile })
  })

  var pathToFile = path.join(__dirname, 'data/test-3/SimpleComponent.vue')
  var strings = m.getStringsForComponent(pathToFile)
  t.ok(strings, 'there is a result')
  t.equal(strings.length, 1, 'there should be one string')
  t.equal(strings[0].string, 'My Title', 'should only match "My Title"')

  cleanupTmp()
  t.end()
})

test('getStringsForComponent and replaceStringInComponent', function (t) {
  var pathToFile = path.join(__dirname, 'data/test-1/src/components/Test.vue')
  var tmpPath = path.join(__dirname, 'tmp/Test.vue')
  fs.writeFileSync(tmpPath, fs.readFileSync(pathToFile, { encoding: 'utf8' }))
  let messagesFile = path.join(__dirname, 'tmp/messages.json')
  fs.writeFileSync(path.join(__dirname, 'tmp/messages.json'), '{}')

  var m = new Manager({
    languages: ['en'],
    path: '/tmp',
    adapter: new JSONAdapter({ path: messagesFile })
  })
  var strings = m.getStringsForComponent(tmpPath)
  t.ok(strings, 'there is a result')

  strings = strings.map((str, i) => Object.assign({}, str, {
    key: `str-${i}`
  }))

  t.doesNotThrow(() => {
    m.replaceStringsInComponent(tmpPath, strings)
  })

  var contentsAfter = fs.readFileSync(tmpPath, { encoding: 'utf8' })
  t.equal(contentsAfter.indexOf('{{ $t(\'str-0\') }}'), 27)
  t.equal(contentsAfter.indexOf('{{ $t(\'str-1\') }}'), 118)
  t.equal(contentsAfter.indexOf('{{ $t(\'str-2\') }}'), 169)

  cleanupTmp()
  t.end()
})

test('addTranslatedString', async function (t) {
  var pathToTranslations = path.join(__dirname, 'tmp/translations.json')
  fs.writeFileSync(pathToTranslations, '{}')

  fs.writeFileSync(path.join(__dirname, 'tmp/messages.json'), '{}')
  var m = new Manager({
    languages: ['en', 'de'],
    adapter: new JSONAdapter({ path: pathToTranslations })
  })
  await m.addTranslatedString('foo.bar.title', { en: 'Hello World', de: 'Hallo Welt' })

  var contents = fs.readFileSync(pathToTranslations, { encoding: 'utf8' })
  var translations = null
  t.doesNotThrow(() => {
    translations = JSON.parse(contents)
  })

  t.ok(translations, 'there are translations')
  t.equals(translations.en.foo.bar.title, 'Hello World', 'english translation is correct')
  t.equals(translations.de.foo.bar.title, 'Hallo Welt', 'german translation is correct')

  cleanupTmp()
  t.end()
})
