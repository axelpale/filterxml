# filterxml

[![npm](https://img.shields.io/npm/v/filterxml.svg?colorB=green)](https://www.npmjs.com/package/filterxml)
[![npm](https://img.shields.io/npm/dm/filterxml.svg)](https://www.npmjs.com/package/filterxml)
[![Travis](https://img.shields.io/travis/axelpale/filterxml.svg)](https://travis-ci.org/axelpale/filterxml)

Keep it simple! Here is a Node.js module to remove unnecessary XML nodes that match given XPath expressions. It uses [xpath](https://www.npmjs.com/package/xpath) and [xmldom](https://www.npmjs.com/package/xmldom) under the hood.

![Logo](logo.png?raw=true "Fight the power!")

## Command-line usage

Install with `$ npm install filterxml -g` and then

    $ filterxml -e pattern -n prefix=namespaceURI input.xml output.xml

For example, remove `Style` and `StyleMap` from a [Keyhole Markup Language](https://en.wikipedia.org/wiki/Keyhole_Markup_Language) document with:

    $ filterxml -e kml:Style --exclude kml:StyleMap \
        --namespace kml=http://www.opengis.net/kml/2.2 \
        source.kml simplified.kml

Specify multiple patterns and namespaces with additional `-e` and `-n` flags. See `filterxml --help` for details.


## Node API usage

Install with `$ npm install filterxml` and then:

    > var filterxml = require('filterxml');
    > filterxml(xmlIn, patterns, namespaces, function (err, xmlOut) { ... })

Where
- `xmlIn` is a string representing the input XML document.
- `patterns` is an array of XPath expressions, like 'book', '/bookstore/book', or '//html:title'. The matching XML nodes will be removed.
- `namespaces` is a map from prefixes to namespace URIs, for example `{ html: 'http://www.w3.org/TR/html4/' }`
- `xmlOut` is a string representing the filtered output XML document.

Common XPath expressions to match nodes include:
- `x:book` to match all book nodes under a namespace associated with the `x` prefix in `namespaces`.
- `x:bookstore/x:book` to match all books **directly** under a bookstore.
- `x:bookstore//x:book` to match all books **somewhere** under a bookstore.
- `x:bookstore/x:book[1]` to match **first** book directly under a bookstore.
- `book` to match all book nodes that **are not** under a namespace. This is a quite rare situation in real-world XML documents.


## Example

Let us filter out all `book` nodes:

    const xmlIn = '<bookstore>' +
        '<book>Animal Farm</book>' +
        '<book>Nineteen Eighty-Four</book>' +
        '<essay>Reflections on Writing</essay>' +
      '</bookstore>';

    filterxml(xmlIn, ['book'], {}, function (err, xmlOut) {
      if (err) { throw err; }
      console.log(xmlOut)
    });

Outputs:

    <bookstore><essay>Reflections on Writing</essay></bookstore>


## Real-world example

Let us remove Style tags from a Keyhole Markup Language (KML) file:

    <?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
      <Document>
        <name>Awesome locations</name>
        <Style id="s_ylw-pushpin060">
          <IconStyle>
            <scale>1.1</scale>
            <Icon>
              <href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href>
            </Icon>
            <hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/>
          </IconStyle>
          <PolyStyle>
            <fill>0</fill>
          </PolyStyle>
        </Style>
        <Placemark>
          <name>Reykjavik</name>
          <Point>
            <coordinates>-21.933333,64.133333,0</coordinates>
          </Point>
        </Placemark>
      </Document>
    </kml>

We read the file, filter it, and save the result. Note how we must add a namespace prefix into our pattern to match nodes under the namespace defined in `kml` node. Note also how we must associate any used prefix with a namespace URI.

    var filterxml = require('filterxml');
    var fs = require('fs');

    var xmlIn = fs.readFileSync('./norway.kml');
    var patterns = ['x:Style'];
    var namespaces = {
      'x': 'http://www.opengis.net/kml/2.2',
    };

    filterxml(xmlIn, patterns, namespaces, function (err, xmlOut) {
      if (err) { throw err; }
      fs.writeFileSync('./norway-simplified.kml', xmlOut);
    });

The resulting `norway-simplified.kml`:

    <?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
      <Document>
        <name>Awesome locations</name>
        <Placemark>
          <name>Reykjavik</name>
          <Point>
            <coordinates>-21.933333,64.133333,0</coordinates>
          </Point>
        </Placemark>
      </Document>
    </kml>


## Working with multiple namespaces

Often XML documents specify multiple namespaces. For example:

    <?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
      <Point>
        <gx:drawOrder>1</gx:drawOrder>
        <coordinates>25.59176188650433,45.6493071755744,0</coordinates>
      </Point>
    </kml>

To match and remove the `gx:drawOrder` node we can **not** just `filterxml(xmlIn, ['gx:drawOrder'], {}, callback)`. The callback would receive an error `No namespace associated with prefix gx in gx:drawOrder`. Instead, we must specify what the prefix `gx` in our XPath pattern means. It misleadingly looks like it has already been specified in the `kml` tag. We cannot blindly trust it. This is because the same prefix can map to different namespace URI in different part of the document:

    <?xml version="1.0" encoding="UTF-8"?>
    <mymap>
      <Places xmlns:kml="http://www.opengis.net/kml/2.2">
        <kml:Placemark>
          <kml:name>A place described with OpenGIS markup</kml:name>
        </kml:Placemark>
      </Places>
      <Cities xmlns:kml="http://www.google.com/kml/ext/2.2">
        <kml:Placemark>
          <kml:name>A place described with Google's KML markup</kml:name>
        </kml:Placemark>
      </Cities
    </mymap>

Therefore we must always specify the prefixes we use in our XPath patterns. To remove `gx:drawOrder` the following is a valid approach. Note that we can use whatever prefix we want as long as we associate it with a correct namespace URI.

    var patterns = ['foo:drawOrder'];
    var namespaces = { foo: 'http://www.google.com/kml/ext/2.2' };
    filterxml(xmlIn, patterns, namespaces, function (err, xmlOut) {
      ...
    });

The snippet above results with `xmlOut` equal to:

    <?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
      <Point>
        <coordinates>25.59176188650433,45.6493071755744,0</coordinates>
      </Point>
    </kml>

So, always declare your prefixes!


## Licence

[MIT](LICENSE)
