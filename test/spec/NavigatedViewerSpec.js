'use strict';

var TestHelper = require('../TestHelper');

var NavigatedViewer = require('../../lib/NavigatedViewer');


describe('NavigatedViewer', function() {

  var container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });



  function createViewer(xml, done) {
    var viewer = new NavigatedViewer({ container: container });

    viewer.importXML(xml, function(err, warnings) {
      done(err, warnings, viewer);
    });
  }


  it('should import simple process', function(done) {
    var xml = require('../fixtures/bpmn/simple.bpmn');
    createViewer(xml, done);
  });


  describe('navigation features', function() {

    var xml = require('../fixtures/bpmn/simple.bpmn');

    it('should include zoomScroll', function(done) {

      createViewer(xml, function(err, warnings, viewer) {
        expect(viewer.get('zoomScroll')).to.exist;

        done(err);
      });
    });


    it('should include moveCanvas', function(done) {
      createViewer(xml, function(err, warnings, viewer) {
        expect(viewer.get('moveCanvas')).to.exist;

        done(err);
      });
    });

  });

});
