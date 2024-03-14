const eofPattern = /[\r\n]+$/

module.exports = (str) => {
  // Get the end-of-file character(s) from the given string.
  //
  // Return
  //   a string
  //

  if (str.length === 0) {
    return ''
  }

  const ending = str.slice(-10)
  const matches = ending.match(eofPattern)

  if (!matches) {
    return ''
  }

  return matches[0]
}
