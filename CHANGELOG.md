# Changelog

## 2.0.0

- Completely refactored the way strings are being found in templates. Previously
it had been done using RegEx while we're now using `vue-eslint-parser`. This not
only is much less error prone, it's also much faster.
- Dealing with whitespace around strings got better. All issues regarding this
should be resolved now.
- Colons at the end (or start) of a string now are ignored and stay in the template.
