---
title: Configuration
---

Your existing project needs to have a `.vue-translation.js` config file prior to
using `vue-translation-manager` from the CLI.

This file contains configuration for the translation manager and the setup of a suiting adapter
and could look like this:

```javascript
const path = require('path')
const { JSONAdapter } = require('vue-translation-manager')

module.exports = {
  srcPath: path.join(__dirname, 'src/'),
  adapter: new JSONAdapter({ path: path.join(__dirname, 'src/i18n/messages.json')}),
  languages: ['en', 'de']
}
```

In this case we're using the provided `JSONAdapter` and we're saying that all our translations
will be stored in a file called `messages.json`. For configuration of the `JSONAdapter` see the
documentation on it.

As soon as you have this configured, you're good to go.
