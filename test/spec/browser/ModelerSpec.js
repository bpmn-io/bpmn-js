'use strict';

var Matchers = require('../Matchers'),
    TestHelper = require('../TestHelper');

/* global bootstrapBpmnJS, inject */


var fs = require('fs');

var Modeler = require('../../../lib/Modeler');


describe('modeler', function() {

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


  it('should import simple process', function(done) {
    var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');
    createModeler(xml, done);
  });


  it('should import empty definitions', function(done) {
    var xml = fs.readFileSync('test/fixtures/bpmn/empty-definitions.bpmn', 'utf8');
    createModeler(xml, done);
  });


  it('should handle errors', function(done) {

    var xml = 'invalid stuff';

    var modeler = new Modeler({ container: container });

    modeler.importXML(xml, function(err) {

      expect(err).toBeDefined();

      done();
    });
  });


  it('should create new diagram', function(done) {
    var modeler = new Modeler({ container: container });
    modeler.createDiagram(done);
  });


  describe('dependency injection', function() {

    it('should be available via di as <bpmnjs>', function(done) {

      var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

      createModeler(xml, function(err, modeler) {

        expect(modeler.get('bpmnjs')).toBe(modeler);
        done(err);
      });
    });

  });

});