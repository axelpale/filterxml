# filterxml

Keep it simple! Here is a Node.js module to remove unnecessary XML nodes that match given XPath expressions. It uses [xpath](https://www.npmjs.com/package/xpath) and [xmldom](https://www.npmjs.com/package/xmldom) under the hood.


## Install

    npm install filterxml


## Usage

    filterxml(xmlIn, patterns, namespaces, function (err, xmlOut) { ... })

Where
- `xmlIn` is a string representing the input XML document.
- `patterns` is an array of XPath expressions, like 'book', '/bookstore/book', or '//html:title'. The matching XML nodes will be removed.
- `namespaces` is a map from prefixes to namespace URIs, for example `{ html: 'http://www.w3.org/TR/html4/' }`
- `xmlOut` is a string representing the filtered output XML document.


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

We read the file, filter it, and save the result.

    var filterxml = require('filterxml');
    var fs = require('fs');

    var xmlIn = fs.readFileSync('./norway.kml');
    var patterns = ['kml:Style'];
    var namespaces = {
      'kml': 'http://www.opengis.net/kml/2.2',
    };

    filterxml(xmlIn, patterns, namespaces, function (err, xmlOut) {
      if (err) { throw err; }
      fs.writeFileSync('./norway-simplified.kml', xmlOut);
    });

The resulting `norway-simplified.kml`:

    <?xml version="1.0" encoding="UTF-8"?>
    <kml>
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


## Licence

[MIT](LICENSE)
