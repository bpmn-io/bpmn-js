'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling - create/remove space', function() {

  var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('create space', function() {


    it('should create space to the right', inject(function(elementRegistry, modeling, bpmnFactory) {

      // given
      var sequenceFlowElement = elementRegistry.get('SequenceFlow_3'),
          sequenceFlow = sequenceFlowElement.businessObject;

      var subProcessElement = elementRegistry.get('SubProcess_1'),
          subProcess = subProcessElement.businessObject;

      var endEventElement = elementRegistry.get('EndEvent_1'),
          endEvent = endEventElement.businessObject;


      var subProcOldPos = {
        x: subProcessElement.x,
        y: subProcessElement.y
      };

      var endEventOldPos = {
        x: endEventElement.x,
        y: endEventElement.y
      };

      var delta = { x: 50, y: 0 },
          direction = 'e';

      // when
      modeling.createSpace([subProcessElement, endEventElement], [], delta, direction);

      // then
      expect(subProcess.di).to.have.position({
        x: subProcOldPos.x + 50,
        y: subProcOldPos.y
      });

      expect(endEvent.di).to.have.position({
        x: endEventOldPos.x + 50,
        y: endEventOldPos.y
      });

      var diWaypoints = bpmnFactory.createDiWaypoints([
        { x: 144, y: 230 },
        { x: 350, y: 230 }
      ]);

      expect(sequenceFlow.di.waypoint).eql(diWaypoints);
    }));


    it('should create space downwards', inject(function(elementRegistry, modeling, bpmnFactory) {

      // given
      var startEventElement = elementRegistry.get('StartEvent_2'),
          startEvent = startEventElement.businessObject;

      var sequenceFlowElement = elementRegistry.get('SequenceFlow_3'),
          sequenceFlow = sequenceFlowElement.businessObject;

      var subProcessElement = elementRegistry.get('SubProcess_1'),
          subProcess = subProcessElement.businessObject;

      var endEventElement = elementRegistry.get('EndEvent_1'),
          endEvent = endEventElement.businessObject;

      var startEventOldPos = {
        x: startEventElement.x,
        y: startEventElement.y
      };

      var subProcOldPos = {
        x: subProcessElement.x,
        y: subProcessElement.y
      };

      var endEventOldPos = {
        x: endEventElement.x,
        y: endEventElement.y
      };

      var delta = { x: 0, y: 50 },
          direction = 's';

      // when
      modeling.createSpace([startEventElement ,subProcessElement, endEventElement], [], delta, direction);

      // then
      expect(startEvent.di).to.have.position({
        x: startEventOldPos.x,
        y: startEventOldPos.y + 50
      });

      expect(subProcess.di).to.have.position({
        x: subProcOldPos.x,
        y: subProcOldPos.y + 50
      });

      expect(endEvent.di).to.have.position({
        x: endEventOldPos.x,
        y: endEventOldPos.y + 50
      });

      var diWaypoints = bpmnFactory.createDiWaypoints([
        { x: 144, y: 280 },
        { x: 300, y: 280 }
      ]);

      expect(sequenceFlow.di.waypoint).eql(diWaypoints);
    }));


    it('should remove space to the left', inject(function(elementRegistry, modeling, bpmnFactory) {

      // given
      var sequenceFlowElement = elementRegistry.get('SequenceFlow_3'),
          sequenceFlow = sequenceFlowElement.businessObject;

      var subProcessElement = elementRegistry.get('SubProcess_1'),
          subProcess = subProcessElement.businessObject;

      var endEventElement = elementRegistry.get('EndEvent_1'),
          endEvent = endEventElement.businessObject;

      var subProcOldPos = {
        x: subProcessElement.x,
        y: subProcessElement.y
      };

      var endEventOldPos = {
        x: endEventElement.x,
        y: endEventElement.y
      };

      var delta = { x: -50, y: 0 },
          direction = 'w';

      // when
      modeling.createSpace([subProcessElement, endEventElement], [], delta, direction);

      // then
      expect(subProcess.di).to.have.position({
        x: subProcOldPos.x - 50,
        y: subProcOldPos.y
      });

      expect(endEvent.di).to.have.position({
        x: endEventOldPos.x - 50,
        y: endEventOldPos.y
      });

      var diWaypoints = bpmnFactory.createDiWaypoints([
        { x: 144, y: 230 },
        { x: 250, y: 230 }
      ]);

      expect(sequenceFlow.di.waypoint).eql(diWaypoints);
    }));


    it('should resize to the right', inject(function(elementRegistry, modeling) {

      // given
      var taskElement = elementRegistry.get('Task_1'),
          task = taskElement.businessObject;

      var subProcessElement = elementRegistry.get('SubProcess_1'),
          subProcess = subProcessElement.businessObject;

      var startEventElement = elementRegistry.get('StartEvent_1'),
          startEvent = startEventElement.businessObject;

      var startEventElement2 = elementRegistry.get('StartEvent_2'),
          startEvent2 = startEventElement2.businessObject;

      var subProcOldPos = {
        x: subProcessElement.x,
        y: subProcessElement.y,
        width: subProcessElement.width,
        height: subProcessElement.height
      };

      var startEventOldPos2 = {
        x: startEventElement2.x,
        y: startEventElement2.y
      };

      var startEventOldPos = {
        x: startEventElement.x,
        y: startEventElement.y
      };

      var taskOldPos = {
        x: taskElement.x,
        y: taskElement.y
      };

      var delta = { x: 50, y: 0 },
          direction = 'w';

      // when
      modeling.createSpace([startEventElement, startEventElement2, taskElement], [subProcessElement], delta, direction);

      // then
      expect(subProcess.di).to.have.bounds({
        x: subProcOldPos.x + 50,
        y: subProcOldPos.y,
        width: subProcOldPos.width - 50,
        height: subProcOldPos.height
      });

      expect(startEvent.di).to.have.position({
        x: startEventOldPos.x + 50,
        y: startEventOldPos.y
      });

      expect(startEvent2.di).to.have.position({
        x: startEventOldPos2.x + 50,
        y: startEventOldPos2.y
      });

      expect(task.di).to.have.position({
        x: taskOldPos.x + 50,
        y: taskOldPos.y
      });
    }));

  });

});
