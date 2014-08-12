'use strict';

var Matchers = require('../Matchers'),
    TestHelper = require('../TestHelper');


var fs = require('fs');

var Modeler = require('../../lib/Modeler');


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


  describe('overlay support', function() {

    it('should allow to add overlays', function(done) {

      var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

      createModeler(xml, function(err, viewer) {

        // given
        var overlays = viewer.get('overlays'),
            elementRegistry = viewer.get('elementRegistry');

        // assume
        expect(overlays).toBeDefined();
        expect(elementRegistry).toBeDefined();


        // when
        overlays.add('SubProcess_1', 'badge', {
          position: {
            bottom: 0,
            right: 0
          },
          html: '<div style="max-width: 50px">YUP GREAT STUFF!</div>'
        });

        overlays.add('StartEvent_1', 'badge', {
          position: {
            top: 0,
            left: 0
          },
          html: '<div style="max-width: 50px">YUP GREAT STUFF!</div>'
        });

        // then
        expect(overlays.get({ element: 'SubProcess_1', type: 'badge' }).length).toBe(1);
        expect(overlays.get({ element: 'StartEvent_1', type: 'badge' }).length).toBe(1);

        done(err);
      });

    });

  });


  describe('cli support', function() {

    it('should ship with cli', function(done) {

      var xml = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

      createModeler(xml, function(err, viewer) {

        // given
        var cli = viewer.get('cli');

        // assume
        expect(cli).toBeDefined();

        // when
        var subProcessShape = cli.element('SubProcess_1');

        // then
        expect(subProcessShape.id).toEqual('SubProcess_1');

        done(err);
      });

    });

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