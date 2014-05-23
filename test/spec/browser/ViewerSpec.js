var fs = require('fs');

var Viewer = require('../../../lib/Viewer');

var Matchers = require('../Matchers');


describe('Viewer', function() {

  beforeEach(Matchers.add);

  var container;

  beforeEach(function() {
    container = document.createElement('div');
    document.getElementsByTagName('body')[0].appendChild(container);
  });


  it('should import simple process', function(done) {

    var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  it('should import empty definitions', function(done) {

    var xml = fs.readFileSync('test/fixtures/bpmn/empty-definitions.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  describe('error handling', function() {

    it('should handle errors', function(done) {

      var xml = 'invalid stuff';

      var renderer = new Viewer(container);

      renderer.importXML(xml, function(err) {

        expect(err).toBeDefined();

        done();
      });
    });

  });


  describe('export', function() {

    it('should export svg', function(done) {

      // given
      var xml = fs.readFileSync('test/fixtures/bpmn/empty-definitions.bpmn', 'utf8');
      var renderer = new Viewer(container);

      renderer.importXML(xml, function(err) {

        if (err) {
          return done(err);
        }

        // when
        renderer.saveSVG(function(err, svg) {

          if (err) {
            return done(err);
          }

          var expectedStart = '<?xml version="1.0" encoding="utf-8"?>';
          var expectedEnd = '</svg>';

          // then
          expect(svg.indexOf(expectedStart)).toEqual(0);
          expect(svg.indexOf(expectedEnd)).toEqual(svg.length - expectedEnd.length);

          // ensure correct rendering of SVG contents
          expect(svg.indexOf('undefined')).toBe(-1);

          done();
        });
      });
    });

  });

});