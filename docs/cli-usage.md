# CLI Usage

```
vue-translation-manager [command]

Commands:
  vue-translation-manager translate     Translate vue files in path
  vue-translation-manager clean         Remove unused translations from
                                        translations resource
  vue-translation-manager add [key]     Add a new translation to the resource
                                        file(s)
  vue-translation-manager edit [key]    Edit an existing translation
  vue-translation-manager delete [key]  Delete an existing translation

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

## `translate`

This command starts the interactive translation manager. It looks through all the `.vue` files
inside your configured `srcPath` and detects untranslated strings.

In an interactive way you then can provide translations for all the configured languages and
the strings in the component will get replaced and the translations saved. You can repeat
this as long as there are untranslated strings in at least one of your components.

Optionally you can pass the `--ask-key` parameter. Per default we generate a key for every
untranslated string based on where it occurs and on the string itself. If you don't want this
you should provide the mentioned parameter and it will ask you to provide a key for every
string to translate. If you are content with the default string then just hit `enter`. You can
also enter a complete new key, separated by dots, or just enter a single word. Then it will
just replace the last part of the suggested key.

## `clean`

This command looks at all the translations in your configured translation files and searches
for their usages inside your `.vue` components. It presents you with all the keys it didn't
find a usage for and gives you a choice to either delete them, keep them or ask for every single
one. Please be aware that we cannot track every possible usage, so take care what you delete.

An example where we can not track that the key `global.languages.en` is still being used:

```vue
<a v-for="language in languages" :key="language">
  {{ $t(`global.languages.${language}`) }}
</a>
```

## `add [key]`

Add translations for a new key. It will ask you to provide the translations for all your
configured languages and stores them in your translation file(s).

## `edit [key]`

Edit an existing key. The command will ask you to provide new translations but suggests the
existing ones as default.

## `delete [key]`

Delete the translations for a given key.
