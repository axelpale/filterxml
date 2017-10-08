
const filterxml = require('../index');
const should = require('should');  // eslint-disable-line no-unused-vars


describe('filterxml', function () {

  it('should remove single node', function (done) {

    const xmlIn = '<bookstore><book>Animal Farm</book></bookstore>';
    filterxml(xmlIn, ['book'], {}, function (err, xmlOut) {
      xmlOut.should.equal('<bookstore/>');
      done();
    });
  });

  it('should remove all identical nodes', function (done) {

    const xmlIn = '<bookstore>' +
        '<book>Animal Farm</book>' +
        '<book>Nineteen Eighty-Four</book>' +
        '<essay>Reflections on Writing</essay>' +
      '</bookstore>';

    filterxml(xmlIn, ['book'], {}, function (err, xmlOut) {
      xmlOut.should.equal('<bookstore>' +
          '<essay>Reflections on Writing</essay>' +
        '</bookstore>');
      done();
    });
  });

  it('should remove all sub nodes', function (done) {

    const xmlIn = '<bookstore>' +
        '<book>Animal Farm</book>' +
        '<book>Nineteen Eighty-Four</book>' +
        '<essay>Reflections on Writing</essay>' +
      '</bookstore>';

    filterxml(xmlIn, ['bookstore'], {}, function (err, xmlOut) {
      xmlOut.should.equal('');
      done();
    });
  });

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
      '</kml>';

    const ps = ['Placemark', 'kml:Point'];
    const ns = { 'kml': 'http://www.opengis.net/kml/2.2' };

    filterxml(xmlIn, ps, ns, function (err, xmlOut) {

      var xmlOutGoal = '<?xml version="1.0" encoding="utf-8"?>' +
        '<kml xmlns="http://www.opengis.net/kml/2.2">' +
          '<Document>' +
            '<Placemark>' +
              '<name>Portland</name>' +
            '</Placemark>' +
          '</Document>' +
        '</kml>';

      xmlOut.should.equal(xmlOutGoal);
      done();
    });
  });

});
