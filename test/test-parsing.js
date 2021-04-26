const fs = require('fs')
const path = require('path')
const test = require('tape')
const Manager = require('../')
const { JSONAdapter } = require('../')
const { cleanupTmp } = require('./utils')

test('text nodes', function (t) {
  let messagesFile = path.join(__dirname, 'tmp/messages.json')
  fs.writeFileSync(path.join(__dirname, 'tmp/messages.json'), '{}')
  let componentPath = path.join(__dirname, 'data/components/ComponentWithTextNodes.vue')
  let componentSrc = fs.readFileSync(componentPath, { encoding: 'utf8' })

  var m = new Manager({
    languages: ['en'],
    path: '/tmp',
    adapter: new JSONAdapter({ path: messagesFile })
  })
  t.ok(m, 'initialized manager is not null')

  let strings = m.getStringsForComponent(componentPath)
  t.equal(strings.length, 3)

  t.equal(componentSrc.substring(strings[0].range[0], strings[0].range[1]), 'Hello World')
  t.equal(componentSrc.substring(strings[2].range[0], strings[2].range[1]), 'Whitespace should be correctly handled, too.')

  cleanupTmp()
  t.end()
})

test('attributes', function (t) {
  let messagesFile = path.join(__dirname, 'tmp/messages.json')
  fs.writeFileSync(path.join(__dirname, 'tmp/messages.json'), '{}')
  let componentPath = path.join(__dirname, 'data/components/ComponentWithAttributes.vue')
  let componentSrc = fs.readFileSync(componentPath, { encoding: 'utf8' })

  var m = new Manager({
    languages: ['en'],
    path: '/tmp',
    attributes: ['foo'],
    adapter: new JSONAdapter({ path: messagesFile })
  })
  t.ok(m, 'initialized manager is not null')

  let strings = m.getStringsForComponent(componentPath)
  t.equal(strings.length, 3)

  t.equal(componentSrc.substring(strings[0].range[0], strings[0].range[1]), 'Cute cat')
  t.equal(componentSrc.substring(strings[2].range[0], strings[2].range[1]), 'custom attribute')

  cleanupTmp()
  t.end()
})

test('text nodes with expressions', function (t) {
  let messagesFile = path.join(__dirname, 'tmp/messages.json')
  fs.writeFileSync(path.join(__dirname, 'tmp/messages.json'), '{}')
  let componentPath = path.join(__dirname, 'data/components/ComponentWithTextNodesAndExpressions.vue')
  let componentSrc = fs.readFileSync(componentPath, { encoding: 'utf8' })

  var m = new Manager({
    languages: ['en'],
    path: '/tmp',
    adapter: new JSONAdapter({ path: messagesFile })
  })
  t.ok(m, 'initialized manager is not null')

  let strings = m.getStringsForComponent(componentPath)
  t.equal(strings.length, 4)

  t.equal(strings[0].expressions.length, 0, 'Ignore expressions if they are not in the middle of a string')
  t.equal(strings[1].expressions.length, 0)
  t.equal(strings[1].text, 'Your name', 'Ignore colons')
  t.equal(strings[3].expressions.length, 1)
  t.equal(strings[3].expressions[0].text, '{{ clicks }}')
  t.equal(strings[3].expressions[0].expr, 'clicks')
  let exprRange = strings[3].expressions[0].range
  t.equals(componentSrc.substring(exprRange[0], exprRange[1]), '{{ clicks }}')

  cleanupTmp()
  t.end()
})
