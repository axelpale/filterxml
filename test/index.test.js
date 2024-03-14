/* global describe,it */

const filterxml = require('../index')
const should = require('should')

describe('filterxml', function () {
  it('should remove single node', function (done) {
    const xmlIn = '<bookstore><book>Animal Farm</book></bookstore>'
    filterxml(xmlIn, ['book'], {}, function (err, xmlOut) {
      should.equal(err, null)
      xmlOut.should.equal('<bookstore/>')
      done()
    })
  })

  it('should remove all identical nodes', function (done) {
    const xmlIn = '<bookstore>' +
        '<book>Animal Farm</book>' +
        '<book>Nineteen Eighty-Four</book>' +
        '<essay>Reflections on Writing</essay>' +
      '</bookstore>'

    filterxml(xmlIn, ['book'], {}, function (err, xmlOut) {
      should.equal(err, null)
      xmlOut.should.equal('<bookstore>' +
          '<essay>Reflections on Writing</essay>' +
        '</bookstore>')
      done()
    })
  })

  it('should remove all sub nodes', function (done) {
    const xmlIn = '<bookstore>' +
        '<book>Animal Farm</book>' +
        '<book>Nineteen Eighty-Four</book>' +
        '<essay>Reflections on Writing</essay>' +
      '</bookstore>'

    filterxml(xmlIn, ['bookstore'], {}, function (err, xmlOut) {
      should.equal(err, null)
      xmlOut.should.equal('')
      done()
    })
  })

  it('should be namespace aware', function (done) {
    const xmlIn = '<?xml version="1.0" encoding="utf-8"?>' +
      '<kml xmlns="http://www.opengis.net/kml/2.2">' +
        '<Document>' +
          '<Placemark>' +
            '<name>Portland</name>' +
            '<Point>' +
              '<coordinates>-122.681944,45.52,0</coordinates>' +
            '</Point>' +
          '</Placemark>' +
        '</Document>' +
      '</kml>'

    const ps = ['Placemark', 'kml:Point']
    const ns = { kml: 'http://www.opengis.net/kml/2.2' }

    filterxml(xmlIn, ps, ns, function (err, xmlOut) {
      should.equal(err, null)

      const xmlOutGoal = '<?xml version="1.0" encoding="utf-8"?>' +
        '<kml xmlns="http://www.opengis.net/kml/2.2">' +
          '<Document>' +
            '<Placemark>' +
              '<name>Portland</name>' +
            '</Placemark>' +
          '</Document>' +
        '</kml>'

      xmlOut.should.equal(xmlOutGoal)
      done()
    })
  })

  it('should deal with multiple namespaces', function (done) {
    // Let us remove gx:drawOrder
    const xmlIn = '<?xml version="1.0" encoding="utf-8"?>' +
      '<kml xmlns="http://www.opengis.net/kml/2.2" ' +
      'xmlns:gx="http://www.google.com/kml/ext/2.2">' +
        '<Document>' +
          '<Placemark>' +
            '<name>Portland</name>' +
            '<Point>' +
              '<gx:drawOrder>1</gx:drawOrder>' +
              '<coordinates>-122.681944,45.52,0</coordinates>' +
            '</Point>' +
          '</Placemark>' +
        '</Document>' +
      '</kml>'

    const ps = ['gkml:drawOrder']
    const ns = { gkml: 'http://www.google.com/kml/ext/2.2' }

    filterxml(xmlIn, ps, ns, function (err, xmlOut) {
      should.equal(err, null)

      const xmlOutGoal = '<?xml version="1.0" encoding="utf-8"?>' +
        '<kml xmlns="http://www.opengis.net/kml/2.2" ' +
        'xmlns:gx="http://www.google.com/kml/ext/2.2">' +
          '<Document>' +
            '<Placemark>' +
              '<name>Portland</name>' +
              '<Point>' +
                '<coordinates>-122.681944,45.52,0</coordinates>' +
              '</Point>' +
            '</Placemark>' +
          '</Document>' +
        '</kml>'

      xmlOut.should.equal(xmlOutGoal)
      done()
    })
  })

  it('should notify about missing namespace', function (done) {
    const xmlIn = '<?xml version="1.0" encoding="utf-8"?>' +
      '<kml xmlns="http://www.opengis.net/kml/2.2">' +
        '<Document/>' +
      '</kml>'
    const ps = ['kml:Document']

    filterxml(xmlIn, ps, {}, function (err) {
      (/namespace/).test(err.message)
      done()
    })
  })

  it('should preserve end-of-file', function (done) {
    const xmlIn = '<?xml version="1.0" encoding="utf-8"?>' +
      '<kml xmlns="http://www.opengis.net/kml/2.2">' +
        '<Document/>' +
      '</kml>\r\n'
    const ps = ['kml:Document']
    const ns = { kml: 'http://www.opengis.net/kml/2.2' }

    filterxml(xmlIn, ps, ns, function (err, xmlOut) {
      should.equal(err, null)
      should.equal(xmlOut, '<?xml version="1.0" encoding="utf-8"?>' +
        '<kml xmlns="http://www.opengis.net/kml/2.2"/>\r\n')

      done()
    })
  })
})
