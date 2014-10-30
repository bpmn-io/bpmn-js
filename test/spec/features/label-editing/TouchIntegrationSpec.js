'use strict';

var TestHelper = require('../../../TestHelper');


var Modeler = require('../../../../lib/Modeler');


var fs = require('fs');


describe('direct editing - touch integration', function() {

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


  it('should edit labels via double tap (manual test)', function(done) {
    var xml = fs.readFileSync('test/fixtures/bpmn/features/label-editing/labels.bpmn', 'utf8');
    createModeler(xml, done);
  });

});