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
        var gateway = bpmnFactory.create('bpmn:ParallelGateway');

        expect(gateway.$type).to.equal('bpmn:ParallelGateway');
        expect(gateway.id).to.match(/^Gateway_/g);
      }));


      it('should assign id with generic semantic prefix (Event)', inject(function(bpmnFactory) {
        var event = bpmnFactory.create('bpmn:EndEvent');

        expect(event.$type).to.equal('bpmn:EndEvent');
        expect(event.id).to.match(/^Event_/g);
      }));


      it('should assign id with generic semantic prefix (Flow)', inject(
        function(bpmnFactory) {
          var flow = bpmnFactory.create('bpmn:SequenceFlow');

          expect(flow.$type).to.equal('bpmn:SequenceFlow');
          expect(flow.id).to.match(/^Flow_/g);
        })
      );


      it('should assign id with generic semantic prefix (Flow)', inject(
        function(bpmnFactory) {
          var flow = bpmnFactory.create('bpmn:MessageFlow');

          expect(flow.$type).to.equal('bpmn:MessageFlow');
          expect(flow.id).to.match(/^Flow_/g);
        })
      );


      it('should assign id with specific semantic prefix (DataStore)', inject(
        function(bpmnFactory) {
          var dataStore = bpmnFactory.create('bpmn:DataStore');

          expect(dataStore.$type).to.equal('bpmn:DataStore');
          expect(dataStore.id).to.match(/^DataStore_/g);
        })
      );


      it('should assign id with specific semantic prefix (DataObject)', inject(
        function(bpmnFactory) {
          var dataObject = bpmnFactory.create('bpmn:DataObject');

          expect(dataObject.$type).to.equal('bpmn:DataObject');
          expect(dataObject.id).to.match(/^DataObject_/g);
        })
      );


      it('should assign id with specific semantic prefix (DataObjectReference)', inject(
        function(bpmnFactory) {
          var dataObjectReference = bpmnFactory.create('bpmn:DataObjectReference');

          expect(dataObjectReference.$type).to.equal('bpmn:DataObjectReference');
          expect(dataObjectReference.id).to.match(/^DataObjectReference_/g);
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
