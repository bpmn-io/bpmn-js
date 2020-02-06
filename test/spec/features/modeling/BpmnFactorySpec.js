import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features - bpmn-factory', function() {

  var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

  var testModules = [ modelingModule, coreModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('create element', function() {

    it('should return instance', inject(function(bpmnFactory) {

      var task = bpmnFactory.create('bpmn:Task');
      expect(task).to.exist;
      expect(task.$type).to.equal('bpmn:Task');
    }));


    it('should assign id (with semantic prefix)', inject(function(bpmnFactory) {
      var plane = bpmnFactory.create('bpmndi:BPMNPlane');

      expect(plane.$type).to.equal('bpmndi:BPMNPlane');
      expect(plane.id).to.match(/^BPMNPlane_/g);
    }));


    it('should assign bpmn:LaneSet id', inject(function(bpmnFactory) {
      var set = bpmnFactory.create('bpmn:LaneSet');

      expect(set.id).to.exist;
    }));


    describe('generic id', function() {

      it('should assign id with generic semantic prefix (Activity)', inject(function(bpmnFactory) {
        var task = bpmnFactory.create('bpmn:ServiceTask');

        expect(task.$type).to.equal('bpmn:ServiceTask');
        expect(task.id).to.match(/^Activity_/g);
      }));


      it('should assign id with generic semantic prefix (Gateway)', inject(function(bpmnFactory) {
        var task = bpmnFactory.create('bpmn:ParallelGateway');

        expect(task.$type).to.equal('bpmn:ParallelGateway');
        expect(task.id).to.match(/^Gateway_/g);
      }));


      it('should assign id with generic semantic prefix (Event)', inject(function(bpmnFactory) {
        var task = bpmnFactory.create('bpmn:EndEvent');

        expect(task.$type).to.equal('bpmn:EndEvent');
        expect(task.id).to.match(/^Event_/g);
      }));


      it('should assign id with generic semantic prefix (FlowElement)', inject(
        function(bpmnFactory) {
          var task = bpmnFactory.create('bpmn:SequenceFlow');

          expect(task.$type).to.equal('bpmn:SequenceFlow');
          expect(task.id).to.match(/^Flow_/g);
        })
      );
    });
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
      expect(result).eql([
        bpmnFactory.create('dc:Point', { x: 0, y: 0 }),
        bpmnFactory.create('dc:Point', { x: 0, y: 0 })
      ]);

      // expect original not to have been accidently serialized
      expect(result[0].$attrs).to.eql({});
    }));
  });

});
