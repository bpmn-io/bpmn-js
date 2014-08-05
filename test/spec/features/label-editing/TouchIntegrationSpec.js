'use strict';

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');

/* global bootstrapViewer, inject */


var fs = require('fs');

var Modeler = require('../../../../lib/Modeler');

var labelEditingModule = require('../../../../lib/features/label-editing'),
    touchModule = require('diagram-js/lib/features/touch');


describe('direct editing - touch integration', function() {

  beforeEach(Matchers.addDeepEquals);


  var container;

  beforeEach(function() {
    container = jasmine.getEnv().getTestContainer();
  });


  function createModeler(xml, done) {
    var modeler = new Modeler({ container: container });

    modeler.importXML(xml, function(err) {
      done(err, modeler);
    });
  }


  it('should work on modeler (manual test)', function(done) {
    var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');
    createModeler(xml, done);
  });


  describe('event integration', function() {

    var diagramXML = fs.readFileSync('test/fixtures/bpmn/features/label-editing/labels.bpmn', 'utf-8');

    var testModules = [ labelEditingModule, touchModule ];

    beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));

    it('should work via dbltap (manual test)', function() { });
  });

});