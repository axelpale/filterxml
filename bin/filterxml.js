#!/usr/bin/env node

const filterxml = require('../index')
const program = require('commander')
const fs = require('fs')
const v = require('../lib/version')

const increaseVerbosity = function (verb, total) {
  return total + 1
}

const collect = function (item, list) {
  return list.concat([item])
}

const parseNamespaces = function (items) {
  // Transform an array of prefix-namespaceURI pair strings into
  // a map from prefix to namespaceURI.
  //
  // Parameters:
  //   items
  //     array or undefined.
  //
  // Return
  //   an object
  //

  if (!items) {
    items = []
  }

  return items.reduce(function (acc, item) {
    const parts = item.split('=')

    if (parts.length !== 2) {
      throw new Error('Invalid prefix-namespaceURI pair: ' + item)
    }

    acc[parts[0]] = parts[1]

    return acc
  }, {})
}

const action = function (sourcePath, targetPath, options, command) {
  // Main CLI action
  //
  const patterns = options.exclude || []
  const namespaces = parseNamespaces(options.namespace)

  fs.readFile(sourcePath, function (errr, inXml) {
    if (errr) {
      throw errr
    }

    // console.log('patterns', patterns)
    // console.log('inXML', inXml)

    filterxml(inXml, patterns, namespaces, function (errf, outXml) {
      if (errf) {
        throw errf
      }

      fs.writeFile(targetPath, outXml, function (errw) {
        if (errw) {
          throw errw
        }

        if (program.verbose >= 1) {
          console.log('Processed XML successfully')
        }
      })
    })
  })
}

program
  .version(v)
  .description('Filter out specific nodes from a source XML file and\n' +
    '  save the resulting XML to the target filepath.')
  .argument('<source>', 'filepath for XML input')
  .argument('<target>', 'filepath for XML output')
  .option(
    '-e, --exclude <xpath>',
    'Exclude nodes that match xpath',
    collect,
    []
  )
  .option(
    '-n, --namespace <prefix=URI>',
    'Associate a prefix with a namespace URI.',
    collect,
    []
  )
  .option(
    '-v, --verbose',
    'Increase verbosity',
    increaseVerbosity,
    0
  )
  .action(action)

program.on('--help', function () {
  // Additional newline after the help body. For clarity.
  console.log('')
})

program.showHelpAfterError()

// Parse arguments
program.parse()
