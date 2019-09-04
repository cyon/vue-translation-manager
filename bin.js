#!/usr/bin/env node
require('babel-core').transform('code', {})

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const chalk = require('chalk')
const replaceAll = require('replace-string')
const inquirer = require('inquirer')
const Manager = require('./')

var manager = null

require('yargs') // eslint-disable-line
  .command('translate', 'Translate vue files in path', (yargs) => {
    yargs
      .option('askKey', {
        describe: 'Possibility to edit the auto-generated key'
      })
  }, (argv) => {
    manager = setUpManager(argv)
    launchInteractiveTranslationPrompt(argv.askKey)
  })
  .command('clean', 'Remove unused translations from translations resource', (yargs) => {
  }, async (argv) => {
    manager = setUpManager(argv)
    var unusedTranslations = await manager.getUnusedTranslations()
    console.log('❗️ The following translations are not used anywhere:')
    unusedTranslations.map((translation) => {
      console.log(chalk.bold('> ') + chalk.gray(translation))
    })

    var prompt = inquirer.createPromptModule()
    prompt([{
      type: 'list',
      name: 'mode',
      message: 'What do you want to do with them?',
      choices: [
        { name: 'Delete', value: 'delete' },
        { name: 'Ask for each', value: 'ask' },
        { name: 'Nothing', value: 'nothing' }
      ]
    }]).then(async (choice) => {
      if (choice.mode === 'nothing') process.exit(0)

      if (choice.mode === 'delete') {
        await manager.deleteTranslations(unusedTranslations)
        console.log('🎉 Deleted all unused translations')

        process.exit(0)
      }

      if (choice.mode === 'ask') {
        let choices = unusedTranslations.map((translation) => {
          return {
            type: 'list',
            name: translation.replace(/\./g, '/'),
            message: `Do you want to delete "${translation}"?`,
            choices: [
              { name: 'Yes', value: true },
              { name: 'No', value: false }
            ]
          }
        })

        let deletions = []
        prompt(choices).then(async (answers) => {
          Object.keys(answers).map((key) => {
            if (answers[key]) deletions.push(key.replace(/\//g, '.'))
          })

          await manager.deleteTranslations(deletions)
          console.log('🎉 Deleted selected translations')
        })
      }
    })
  })
  .command('add [key]', 'Add a new translation to the resource file(s)', (yargs) => {
    yargs
      .positional('key', {
        describe: 'Key for the new translation'
      })
  }, (argv) => {
    manager = setUpManager(argv)

    var questions = []
    var prompt = inquirer.createPromptModule()
    manager.getLanguages().map((lang) => {
      questions.push({
        type: 'input',
        message: `[${lang}] Translation for "${argv.key}"`,
        name: lang
      })
    })

    prompt(questions).then((answers) => {
      manager.addTranslatedString(argv.key, answers)
      console.log(chalk.green('Added translated string 👍🏻'))
    })
  })
  .command('edit [key]', 'Edit an existing translation', (yargs) => {
    yargs
      .positional('key', {
        describe: 'Key of the translation to edit'
      })
  }, async (argv) => {
    manager = setUpManager(argv)

    let translations = await manager.getTranslationsForKey(argv.key)

    var questions = []
    var prompt = inquirer.createPromptModule()
    manager.getLanguages().map((lang) => {
      questions.push({
        type: 'input',
        message: `[${chalk.yellow(lang)}] Translation for "${argv.key}"`,
        name: lang,
        default: translations[lang] || ''
      })
    })

    prompt(questions).then((answers) => {
      manager.addTranslatedString(argv.key, answers)
      console.log(chalk.green('Successfully edited translations ✌🏻'))
    })
  })
  .command('delete [key]', 'Delete an existing translation', (yargs) => {
    yargs
      .positional('key', {
        describe: 'Key of the translation to delete'
      })
  }, async (argv) => {
    manager = setUpManager(argv)

    await manager.deleteTranslations(argv.key)
    console.log(chalk.green('Successfully deleted translation 💥'))
  })
  .command('validate', 'Checks if translated messages are available in all configured languages', (yargs) => {

  }, async (argv) => {
    manager = setUpManager(argv)
    let missingKeys = await manager.validate()
    if (Object.keys(missingKeys).length > 0) {
      console.log(`❗️️ Messages incomplete.\n\nThe following keys are missing:`)
      Object.keys(missingKeys).map((index) => {
        const keys = missingKeys[index]
        const count = keys.length
        console.log(`\nLanguage: ${chalk.red.bold(index)}\nKeys missing: ${chalk.red.bold(count)}:\n  ${chalk.red(keys.join('\n  '))}`)
      })
      process.exit(1)
    }
    console.log(chalk.green('Looking good! 👌🏻'))
  })
  .argv

function launchInteractiveTranslationPrompt (askKey) {
  var globPattern = `${manager.getSrcPath()}/**/*.vue`
  var files = glob.sync(globPattern, null)
  var untranslatedComponents = files.filter((file) => containsUntranslatedStrings(file)).map((file) => path.relative(process.cwd(), file))
  if (!untranslatedComponents.length) {
    console.log(chalk.green('All components translated'))
    process.exit(0)
  }

  var prompt = inquirer.createPromptModule()
  prompt([{
    type: 'list',
    name: 'file',
    message: 'Choose the next file to translate',
    choices: untranslatedComponents
  }]).then(async (answers) => {
    var filePath = path.resolve(answers.file)
    var strings = manager.getStringsForComponent(filePath)
    var fileContents = fs.readFileSync(filePath, { encoding: 'utf8' })

    var questions = []
    var replacements = []

    var usedKeys = []

    for (var i = 0; i < strings.length; i++) {
      let str = strings[i]
      var key = await manager.getSuggestedKey(filePath, str.text, usedKeys)
      usedKeys.push(key)

      replacements.push({
        key: key,
        type: str.type,
        range: str.range,
        text: str.text,
        expressions: str.expressions
      })

      if (askKey) {
        questions.push({
          type: 'input',
          message: `Key for "${str.string}"`,
          name: `${replaceAll(key, '.', '/')}.key`,
          default: key
        })
      }

      // let textForDisplay = ''
      // let defaultString = ''

      // if (str.expressions) {
      //   let i = 1
      //   let lastIndex = 0

      //   str.expressions.map((expression) => {
      //     textForDisplay += str.originalString.substring(lastIndex, expression.indexStart)
      //     defaultString += str.originalString.substring(lastIndex, expression.indexStart)
      //     lastIndex = expression.indexEnd + 2
      //     textForDisplay += `${chalk.red(`{{${expression.expr}}}`)}${chalk.blue(`{${i}}`)}`
      //     defaultString += `{${i}}`

      //     i++
      //   })

      //   textForDisplay += str.originalString.substring(lastIndex)
      //   defaultString += str.originalString.substring(lastIndex)
      // }
      let textForDisplay = getFormattedCodeBlock(fileContents, str)
      let defaultString = getDefaultString(str)

      manager.getLanguages().map((lang) => {
        questions.push({
          type: 'input',
          message: `[${chalk.yellow(lang)}] Translation for: \n ${textForDisplay}`,
          name: `${replaceAll(key, '.', '/')}.${lang}`,
          default: defaultString
        })
      })
    }

    prompt(questions).then(async (answers) => {
      let keys = Object.keys(answers)
      for (var i = 0; i < keys.length; i++) {
        let key = keys[i]
        var keyInitial = replaceAll(key, '/', '.')
        var newKey = keyInitial
        if (answers[key].key) {
          if (answers[key].key !== keyInitial) {
            newKey = answers[key].key
            if (newKey.indexOf('.') < 0) {
              newKey = keyInitial.substring(0, keyInitial.lastIndexOf('.') + 1) + newKey
            }
            newKey = await manager.getCompatibleKey(newKey)
            replacements.find((replacement) => replacement.key === keyInitial).key = newKey
          }
          delete answers[key].key
        }
        await manager.addTranslatedString(newKey, answers[key])
      }

      manager.replaceStringsInComponent(filePath, replacements)

      prompt([{
        type: 'confirm',
        name: 'continue',
        default: true,
        message: '✨ Translated strings! Do you want to continue?'
      }]).then((answers) => {
        if (!answers.continue) process.exit(0)
        launchInteractiveTranslationPrompt(askKey)
      })
    })
  })
}

function containsUntranslatedStrings (filePath) {
  fs.readFileSync(filePath, { encoding: 'utf8' })
  var results = manager.getStringsForComponent(filePath)
  return (results && results.length > 0)
}

function setUpManager () {
  let config = require(path.join(process.cwd(), '.vue-translation.js'))
  return new Manager(config)
}

function getFormattedCodeBlock (source, match) {
  let before = source.substring(0, match.range[0])
  let textBefore = before.substring(before.lastIndexOf('\n') + 1).trimStart()
  let after = source.substring(match.range[1])
  let textAfter = after.substring(0, after.indexOf('\n'))
  let text = match.text

  // replace expressions
  let offset = 0

  match.expressions.map((expr, i) => {
    let paramStr = chalk.bgCyan(`{${i}}`)
    text = text.substring(0, expr.range[0] + offset)
      + chalk.blue(text.substring(expr.range[0] + offset, expr.range[1] + offset))
      + paramStr
      + text.substring(expr.range[1] + offset)

    // 10 is the length of invisible characters used by chalk
    offset += paramStr.length + 10
  })

  return chalk.gray(textBefore) + text + chalk.gray(textAfter)
}

function getDefaultString (match) {
  let text = match.text
  let offset = 0

  match.expressions.map((expr, i) => {
    let replacement = `{${i}}`
    text = text.substring(0, expr.range[0] + offset)
      + replacement
      + text.substring(expr.range[1] + offset)

    offset += replacement.length - expr.text.length
  })

  return text
}
