/* eslint-disable max-statements */
const xmldom = require('@xmldom/xmldom')
const xpath = require('xpath')

const parser = new xmldom.DOMParser()
const serializer = new xmldom.XMLSerializer()

module.exports = function (xmlIn, patterns, namespaces, callback) {
  // Filter XML
  //
  // Parameters:
  //   xmlIn
  //     string representing XML document
  //   patterns
  //     array of XPath strings
  //   namespaces
  //     a map from prefix strings to namespace URI strings
  //   callback
  //     function (err, xmlOut)

  if (typeof xmlIn !== 'string') {
    // If Buffer
    xmlIn = xmlIn.toString()
  }

  const root = parser.parseFromString(xmlIn, 'text/xml')
  const selector = xpath.useNamespaces(namespaces)

  // Detect if string has at least one non-whitespace character
  const nonspaceDetector = /\S/

  // console.log('namespaceURI', root.documentElement.namespaceURI)
  // console.log('root', root)
  // console.log('patterns', patterns)

  // Remove all nodes that match a XPath pattern
  let i, j, pattern, nodes, parent, prev
  let rootRemoved = false

  for (i = 0; i < patterns.length; i += 1) {
    pattern = patterns[i]

    if (pattern[0] !== '/') {
      pattern = '//' + pattern
    }

    // console.log('pattern', pattern)

    // evaluator = xpath.parse(pattern)
    // console.log('evaluator', evaluator)
    try {
      nodes = selector(pattern, root)
    } catch (e) {
      if (e.message.startsWith('Cannot resolve QName')) {
        const prefix = pattern.split(':')[0]
        const msg = 'No namespace associated with prefix ' + prefix +
          ' in ' + pattern
        return callback(new Error(msg))
      }

      throw e
    }

    // console.log('matched_nodes', nodes)
    // console.log('xpath.select(<pattern>, root)', nodes)

    for (j = 0; j < nodes.length; j += 1) {
      const n = nodes[j]

      // console.log(n.previousSibling.constructor.name)

      parent = n.parentNode
      prev = n.previousSibling

      if (parent === root) {
        // console.log('We found document node')
        rootRemoved = true
        break
      }

      // Okay, n will be removed.
      // We like to remove also the preceding whitespace if there is some.
      // This prevents empty lines when the input xml is nicely indented.
      if (prev && prev.constructor.name === 'Text') {
        if (!nonspaceDetector.test(prev.data)) {
          // Only whitespace. Remove.
          parent.removeChild(prev)
        }
      }
      parent.removeChild(n)
    }

    if (rootRemoved) {
      break // short-circuit
    }
  }

  if (rootRemoved) {
    return callback(null, '')
  }

  // console.log('rootWasNotRemoved')
  // console.log('root', root)

  function serialize () {
    let xmlOut
    const isHtml = false
    try {
      xmlOut = serializer.serializeToString(root, isHtml)
    } catch (e) {
      console.error(e)
      if (e instanceof TypeError) {
        throw e
      } else {
        throw e
      }
    }

    return callback(null, xmlOut)
  }

  serialize()
}
