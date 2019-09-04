# How does it work?

## How we detect untranslated strings

While `v1` was only based on RegEx evaluations of the raw source code, `v2` uses
[`vue-eslint-parser`](https://github.com/mysticatea/vue-eslint-parser) by [mysticatea](https://github.com/mysticatea)
to implement a much more exact (and performant!) parsing of Vue components.

## What kinds of strings can (and can't) be detected

No solution is perfect and `vue-translation-manager` is no exception. That's why we cannot magically find
every single untranslated string in a component. Here's a list of the types of strings that can and, more important,
the ones that can **not** be found.

### Text Nodes

Simple text nodes like the following are the simplest case and can be detected:

```vue
<template>
  <h1>Hello World!</h1>
</template>
```

### Expressions inside Text Nodes

If you're using expressions in a text node, those can be detected, too, and are given as parameters
to the `$t` call and can be used in your messages:

```vue
<template>
  <h1>Hello, {{ name }}, how are you today?</h1>
</template>
```

**However**, if the expression is at the end and not followed by any further text, it simply gets ignored.
If there are colons present at the start or end of a string, they get removed, too.

### Attributes

### Literals in `script` block

### Nested elements

While normal text nodes obviously can be detected, nested elements like the following can not be
recognized as the same string:

```vue
<template>
  <p>Hello <strong>World</strong>, are you having a good day?</p>
</template>
```

In this case we'd end up with three separate messages, *"Hello"*, *"World"* and *", are you having a good day?"*.

If this is not desired, you'd have to put the whole string (`Hello <strong>World</strong>, are you having a good day?`)
into your messages file and manually edit the template to look like the following:

```vue
<template>
  <p v-html="$('your.message.key')"></p>
</template>
```
