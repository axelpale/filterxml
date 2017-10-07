
const filterxml = require('../index');
const should = require('should');  // eslint-disable-line no-unused-vars


describe('filterxml', function () {

  it('should remove single node', function (done) {

    const xmlIn = '<bookstore><book>Animal Farm</book></bookstore>';
    filterxml(['book'], xmlIn, function (err, xmlOut) {
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

    filterxml(['book'], xmlIn, function (err, xmlOut) {
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

    filterxml(['bookstore'], xmlIn, function (err, xmlOut) {
      xmlOut.should.equal('');
      done();
    });
  });

});
