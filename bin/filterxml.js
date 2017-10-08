#!/usr/bin/env node

var filterxml = require('../index');
var program = require('commander');
//var path = require('path');
var fs = require('fs-extra');
var v = require('../lib/version');

var increaseVerbosity = function (verb, total) {
  return total + 1;
};

var collect = function (item, list) {
  list.push(item);
  return list;
};

var parseNamespaces = function (items) {
  // Transform an array of prefix-namespaceURI pair strings into
  // a map from prefix to namespaceURI.
  return items.reduce(function (acc, item) {
    var parts = item.split('=');

    if (parts.length !== 2) {
      throw new Error('Invalid prefix-namespaceURI pair: ' + item);
    }

    acc[parts[0]] = parts[1];

    return acc;
  }, {});
};

var action = function (sourcePath, targetPath) {

  var patterns = program.exclude;
  var namespaces = parseNamespaces(program.namespace);

  fs.readFile(sourcePath, function (errr, inXml) {
    if (errr) {
      throw errr;
    }

    //console.log('patterns', patterns);
    //console.log('inXML', inXml);

    filterxml(inXml, patterns, namespaces, function (errf, outXml) {
      if (errf) {
        throw errf;
      }

      fs.writeFile(targetPath, outXml, function (errw) {
        if (errw) {
          throw errw;
        }

        if (program.verbose >= 1) {
          console.log('Processed XML successfully');
        }
      });
    });
  });
};


program
  .version(v)
  .usage('[options] <source> <target>')
  .description('Filter out specific nodes from a source XML file and\n' +
               '  save the resulting XML to the target filepath.')
  .option('-e, --exclude <xpath>',
          'Exclude nodes that match xpath',
          collect, [])
  .option('-n, --namespace <prefix=URI>',
          'Associate a prefix with a namespace URI.',
          collect, [])
  .option('-v, --verbose', 'Increase verbosity', increaseVerbosity, 0)
  .action(action);


program.on('--help', function () {
  // Additional newline.
  console.log('');
});

program.parse(process.argv);

if (program.args.length === 0) {
  console.error('ERROR: Missing arguments <source> and <target>');
  program.outputHelp();
}

if (program.args.length === 1) {
  console.error('ERROR: Missing argument <target>');
  program.outputHelp();
}
