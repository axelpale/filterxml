/* global describe,it */

const CliTest = require('./cli-test-tool')
const should = require('should') // eslint-disable-line no-unused-vars
const temp = require('temp')
const path = require('path')
const diff = require('diff')
const fs = require('fs')

const COMMAND = 'bin/filterxml.js'

// Automatically track and remove files at exit
temp.track()

const filecompare = function (path1, path2, callback) {
  // Parameters:
  //   path1
  //     primary, the input file path
  //   path2
  //     secondary, the output file path
  //   callback
  //     function (err, areEqual)
  //
  fs.readFile(path1, function (e1, data1) {
    if (e1) {
      return callback(e1)
    }

    fs.readFile(path2, function (e2, data2) {
      if (e2) {
        return callback(e2)
      }

      const s1 = data1.toString().trim()
      const s2 = data2.toString().trim()

      // console.log('-------1-------')
      // console.log(s1)
      // console.log('-------2-------')
      // console.log(s2)
      //
      // console.log(s1 === s2)
      const changes = diff.diffLines(s1, s2)

      // Changes contain equivalent portions too.
      // Return only the parts where there are differences.
      const diffs = changes.filter(function (ch) {
        return ch.added || ch.removed
      })

      // Debug output
      if (diffs.length > 0) {
        diffs.forEach((change) => {
          if (change.added) {
            console.log('found only in expected value: ' + change.value)
          }
          if (change.removed) {
            console.log('found only in output value:   ' + change.value)
          }
        })
      }

      return callback(null, diffs)
    })
  })
}

describe('filterxml cli', function () {
  it('should return unfiltered', function (done) {
    const clit = new CliTest()

    const source = path.resolve(__dirname, 'fixtures', 'sample.kml')
    const target = temp.openSync().path

    clit.exec(COMMAND + ' ' + source + ' ' + target, function (err, res) {
      if (err) {
        return done(err)
      }

      // Should not have any output
      res.stdout.should.equal('')
      res.stderr.should.equal('')

      filecompare(source, target, function (errc, changes) {
        changes.should.eql([])
        return done()
      })
    })
  })

  it('should filter KML', function (done) {
    const clit = new CliTest()

    const source = path.resolve(__dirname, 'fixtures', 'sample.kml')
    const output = temp.openSync().path
    const goal = path.resolve(__dirname, 'fixtures', 'filtered.kml')

    const comm = COMMAND + ' -e kml:Document/kml:Placemark[2]' +
      ' -n kml=http://www.opengis.net/kml/2.2' +
      ' ' + source + ' ' + output

    clit.exec(comm, function (err, res) {
      if (err) {
        return done(err)
      }

      // Should not have any output
      res.stdout.should.equal('')
      res.stderr.should.equal('')

      filecompare(output, goal, function (errc, changes) {

        changes.should.eql([])

        return done()
      })
    })
  })
})
