'use strict';

var Matchers = require('../Matchers'),
    TestHelper = require('../TestHelper');

/* global bootstrapBpmnJS, inject */


var fs = require('fs');

var Viewer = require('../../../lib/Viewer');


describe('viewer', function() {

  beforeEach(Matchers.addDeepEquals);


  var container;

  beforeEach(function() {
    container = jasmine.getEnv().getTestContainer();
  });


  function createViewer(xml, done) {
    var renderer = new Viewer({ container: container });

    renderer.importXML(xml, function(err) {
      done(err, renderer);
    });
  }


  it('should import simple process', function(done) {

    var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

    createViewer(xml, done);
  });


  it('should import empty definitions', function(done) {

    var xml = fs.readFileSync('test/fixtures/bpmn/empty-definitions.bpmn', 'utf8');

    createViewer(xml, done);
  });


  describe('error handling', function() {

    it('should handle non-bpmn input', function(done) {

      var xml = 'invalid stuff';

      createViewer(xml, function(err) {

        expect(err).toBeDefined();

        done();
      });
    });


    it('should handle invalid BPMNPlane#bpmnElement', function(done) {

      var xml = fs.readFileSync('test/fixtures/bpmn/error/di-plane-no-bpmn-element.bpmn', 'utf8');

      createViewer(xml, function(err) {
        expect(err).toBeDefined();
        expect(err.message).toEqual('no rootElement referenced in BPMNPlane <BPMNPlane_1>');

        done();
      });
    });


    it('should handle missing namespace', function(done) {

      var xml = fs.readFileSync('test/fixtures/bpmn/error/missing-namespace.bpmn', 'utf8');

      createViewer(xml, function(err) {
        expect(err).toBeDefined();
        expect(err.message).toEqual(
          'unparsable content <collaboration> detected; this may indicate an invalid BPMN 2.0 diagram file\n' +
          '\tline: 2\n' +
          '\tcolumn: 29\n' +
          '\tnested error: unrecognized element <collaboration>');

        done();
      });
    });

  });


  describe('dependency injection', function() {

    it('should be available via di as <bpmnjs>', function(done) {

      var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

      createViewer(xml, function(err, viewer) {

        expect(viewer.get('bpmnjs')).toBe(viewer);

        done(err);
      });
    });

  });


  describe('export', function() {

    it('should export svg', function(done) {

      // given
      var xml = fs.readFileSync('test/fixtures/bpmn/empty-definitions.bpmn', 'utf8');

      createViewer(xml, function(err, renderer) {

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

          // expect header to be written only once
          expect(svg.indexOf('<svg width="100%" height="100%">')).toBe(-1);
          expect(svg.indexOf('<g class="viewport"')).toBe(-1);

          done();
        });
      });
    });

  });

});