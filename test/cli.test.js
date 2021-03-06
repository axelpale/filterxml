const CliTest = require('command-line-test');
const should = require('should');  // eslint-disable-line no-unused-vars
const temp = require('temp').track();  // track to remove at exit
const path = require('path');
const diff = require('diff');
const fs = require('fs');

const COMMAND = 'bin/filterxml.js';

var filecompare = function (path1, path2, callback) {
  // Parameters:
  //   path1
  //   path2
  //   callback
  //     function (err, areEqual)
  fs.readFile(path1, function (e1, data1) {
    if (e1) {
      return callback(e1);
    }

    fs.readFile(path2, function (e2, data2) {
      if (e2) {
        return callback(e2);
      }

      var s1 = data1.toString().trim();
      var s2 = data2.toString().trim();

      // console.log('-------1-------');
      // console.log(s1);
      // console.log('-------2-------');
      // console.log(s2);
      //
      // console.log(s1 === s2);
      var changes = diff.diffLines(s1, s2);

      // Changes contain equivalent portions too.
      // Return only the parts where there are differences.
      var diffs = changes.filter(function (ch) {
        return ch.added || ch.removed;
      });

      return callback(null, diffs);
    });
  });
};



describe('filterxml cli', function () {

  it('should return unfiltered', function (done) {

    const clit = new CliTest();

    const source = path.resolve(__dirname, 'fixtures', 'sample.kml');
    const target = temp.openSync().path;

    clit.exec(COMMAND + ' ' + source + ' ' + target, function (err, res) {
      if (err) {
        return done(err);
      }

      // Should not have any output
      res.stdout.should.equal('');
      res.stderr.should.equal('');

      filecompare(source, target, function (errc, changes) {
        changes.should.eql([]);
        return done();
      });
    });
  });


  it('should filter KML', function (done) {

    const clit = new CliTest();

    const source = path.resolve(__dirname, 'fixtures', 'sample.kml');
    const output = temp.openSync().path;
    const goal = path.resolve(__dirname, 'fixtures', 'filtered.kml');

    const comm = COMMAND + ' -e kml:Document/kml:Placemark[2]' +
      ' -n kml=http://www.opengis.net/kml/2.2' +
      ' ' + source + ' ' + output;

    clit.exec(comm, function (err, res) {
      if (err) {
        return done(err);
      }

      // Should not have any output
      res.stdout.should.equal('');
      res.stderr.should.equal('');

      filecompare(output, goal, function (errc, changes) {
        changes.should.eql([]);
        return done();
      });
    });
  });
});
