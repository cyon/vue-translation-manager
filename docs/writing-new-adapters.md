# Writing new adapters

You can help us by authoring adapters for different backends. This is fairly easy:

- Write a class that implements some pre-defined methods
- Upload the repository to Github and provide doumentation on how to use it
- Ship it with npm

The following methods must be implemented by your class:

```javascript
class Adapter {
  constructor (opts) {
    // Initialization logic
  }

  // This is being called by the translation manager
  _setLanguages (languages) {}

  // Actually add translations. The translation come in an object, key is the
  // language and value is a string.
  async addTranslations (key, translations) {}

  // Get translations for key. Return value should be an object with languages
  // as keys.
  async getTranslations (key) {}

  // Get all the keys. Return value should be an object with the languages as
  // keys and an array of strings (keys) as the value.
  async getAllKeys () {}

  // `keys` is an array of all the keys. Make sure to delete them for every
  // language.
  async deleteTranslations (keys) {}
}
```

If you created an adapter and published it, make sure to let us know in an issue so we can link to it from here.
