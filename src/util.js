/**
 * Delete the `parent` ref
 * @param {object} el Token element
 */
function deleteParent (el) {
  delete el.parent.children
  delete el.loc
}

/**
 * Strip whitespaces around value
 * @param {object} el Token element
 */
function trimElement (el) {
  let lengthBefore = el.value.length
  el.value = el.value.trimStart()
  el.range[0] = el.range[0] + (lengthBefore - el.value.length)
  lengthBefore = el.value.length

  el.value = el.value.trimEnd()
  el.range[1] = el.range[1] - (lengthBefore - el.value.length)
}

/**
 * Strip colons from start and end of string
 * @param {object} el Token element
 */
function removeColons (el) {
  // Remove colons from string if they are at the end...
  if (el.value[el.value.length - 1] === ':') {
    el.value = el.value.substring(0, el.value.length - 1)
    el.range[1] = el.range[1] - 1
  }

  // ...or at the start
  if (el.value[0] === ':') {
    el.value = el.value.substring(1)
    el.range[0] = el.range[0] + 1
  }

  trimElement(el)
}

/**
 * The given range is usually not for the `value` itself but for the
 * `raw` value. This method fixes the range for the actual `value`, the string
 * we're interested in.
 * @param {object} el Token element
 * @param {string} code The raw source code
 */
function fixRange (el, code) {
  let actual = code.substring(el.range[0], el.range[1])
  if (actual === el.value) return

  let diff = actual.length - el.value.length
  let diffStart = actual.indexOf(el.value)
  let diffEnd = diff - diffStart

  el.range[0] = el.range[0] + diffStart
  el.range[1] = el.range[1] - diffEnd
}

function mapToResult (el) {
  let type
  switch (el.type) {
    case 'VText':
      type = 'textNode'
      break
    case 'VLiteral':
      type = 'attribute'
      break
    case 'Literal':
      type = 'srcBlock'
      break
    default:
      type = null
  }

  let result = {
    type,
    text: el.value,
    range: el.range,
    expressions: []
  }

  return result
}

module.exports.deleteParent = deleteParent
module.exports.trimElement = trimElement
module.exports.removeColons = removeColons
module.exports.fixRange = fixRange
module.exports.mapToResult = mapToResult
