/* eslint-disable max-statements */
var xmldom = require('xmldom');
var xpath = require('xpath');

var parser = new xmldom.DOMParser();
var serializer = new xmldom.XMLSerializer();

module.exports = function (patterns, xmlIn, callback) {

  var root = parser.parseFromString(xmlIn, 'text/xml');

  // console.log('root', root);
  // console.log('root.parentNode', root.parentNode);
  // console.log('patterns', patterns);

  // Remove all nodes that match a XPath pattern
  var i, j, pattern, nodes, n;
  var rootRemoved = false;

  for (i = 0; i < patterns.length; i += 1) {
    pattern = patterns[i];

    if (pattern[0] !== '/') {
      pattern = '//' + pattern;
    }

    nodes = xpath.select(pattern, root);

    //console.log('xpath.select(<pattern>, root)', nodes);
    for (j = 0; j < nodes.length; j += 1) {
      n = nodes[j];

      if (n.parentNode === root) {
        // console.log('We found root');
        rootRemoved = true;
        break;
      }

      n.parentNode.removeChild(n);
    }

    if (rootRemoved) {
      break;  // short-circuit
    }
  }

  if (rootRemoved) {
    return callback(null, '');
  }

  // console.log('rootWasNotRemoved');
  //console.log('root', root);

  (function serialize() {

    var xmlOut;
    var isHtml = false;
    try {
      xmlOut = serializer.serializeToString(root, isHtml);
    } catch (e) {
      console.error(e);
      if (e instanceof TypeError) {
        throw e;
      } else {
        throw e;
      }
    }

    return callback(null, xmlOut);
  }());

};
