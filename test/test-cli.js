const path = require('path')
const test = require('tape')
const { cleanupTmp } = require('./utils')
const { spawnSync } = require('child_process')

const binary = path.join(__dirname, '../bin.js')

test('Simple checks', function (t) {
  t.equal(spawnSync(binary).status, 0, 'Running with no command should yield no error')
  var resultHelp = spawnSync(binary, ['--help'])
  t.equal(resultHelp.status, 0, 'No error occured')
  t.ok(resultHelp.stdout.toString('utf8'), 'There is an output')

  cleanupTmp()
  t.end()
})

test('With arguments from the cli', function (t) {
  cleanupTmp()
  t.end()
})
