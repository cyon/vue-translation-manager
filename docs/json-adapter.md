---
title: JSON Adapter
---

# JSON Adapter

The JSON adapter is being provided by the `vue-translation-manager` package and does not have to be installed separately. You
can use it if you store your translated messages in either one or multiple JSON files.

The adapter can be used as follows:

```js
const path = require('path')
const { JSONAdapter } = require('vue-translation-manager')

module.exports = {
  srcPath: path.join(__dirname, 'src'),
  adapter: new JSONAdapter({ path: path.join(__dirname, 'messages.json') }),
  languages: ['en', 'de']
}
```

If you give a path to a file, we're automatically assuming you're using a single file for your translations. If
the given path is a directory we'll look for files named like this: `[language].json`.

## Using a single file

If you have all your translations in a single file (this is not recommended when you're developing a bigger application), there
are two ways of how this file could be structured:

**Variant 1**
```json
{
  "en": {
    "foo": {
      "bar": "Hello World"
    }
  },
  "de": {
    "foo": {
      "bar": "Hallo Welt"
    }
  }
}
```

**Variant 2**
```json
{
  "foo": {
    "bar": {
      "en": "Hello World",
      "de": "Hallo Welt"
    }
  }
}
```

In the *first variant* the language key is in the root of the file while in *variant 2* it is on the leaf. Per *default* if you
choose the single file variant, we're assuming you use *variant 1*. You can change this like follows:

```js
new JSONAdapter({ path: path.join(__dirname, 'messages.json'), leaf: true })
```
