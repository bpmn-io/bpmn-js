'use strict';

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */


var fs = require('fs');

var modelingModule = require('../../../../lib/features/modeling');


describe('features - bpmn-factory', function() {

  beforeEach(Matchers.addDeepEquals);


  var diagramXML = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf-8');

  var testModules = [ modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('create element', function() {

    it('should return instance', inject(function(bpmnFactory) {

      var task = bpmnFactory.create('bpmn:Task');
      expect(task).toBeDefined();
      expect(task.$type).toEqual('bpmn:Task');
    }));


    it('should assign id (with semantic prefix)', inject(function(bpmnFactory) {
      var task = bpmnFactory.create('bpmn:ServiceTask');

      expect(task.$type).toEqual('bpmn:ServiceTask');
      expect(task.id).toMatch(/^ServiceTask_/g);
    }));


    it('should assign id (with semantic prefix)', inject(function(bpmnFactory) {
      var plane = bpmnFactory.create('bpmndi:BPMNPlane');

      expect(plane.$type).toEqual('bpmndi:BPMNPlane');
      expect(plane.id).toMatch(/^BPMNPlane_/g);
    }));

  });


  describe('create di', function() {

    it('should create waypoints', inject(function(bpmnFactory) {

      // given
      var waypoints = [
        { original: { x: 0, y: 0 }, x: 0, y: 0 },
        { original: { x: 0, y: 0 }, x: 0, y: 0 }
      ];

      // when
      var result = bpmnFactory.createDiWaypoints(waypoints);

      // then
      expect(result).toDeepEqual([
        { $type: 'dc:Point', x: 0, y: 0 },
        { $type: 'dc:Point', x: 0, y: 0 }
      ]);

      // expect original not to have been accidently serialized
      expect(result[0].$attrs).toEqual({});
    }));
  });

});