'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - lanes', function() {


  describe('should add Task', function() {

    var diagramXML = require('./lane-simple.bpmn');

    var testModules = [ coreModule, modelingModule ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('execute', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Lane'),
          // lane = laneShape.businessObject,
          participantShape = elementRegistry.get('Participant_Lane'),
          bpmnProcess = participantShape.businessObject.processRef;

      // when
      var newTaskShape = modeling.createShape({ type: 'bpmn:Task' }, { x: 250, y: 150 }, laneShape);

      var newTask = newTaskShape.businessObject;

      // then
      expect(newTask.$parent).to.equal(bpmnProcess);
      expect(bpmnProcess.flowElements).to.contain(newTask);

      // TODO(nre): correctly wire flowNodeRef(s)
      // expect(lane.flowNodeRef).to.contain(newTask);
    }));


    it('undo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var laneShape = elementRegistry.get('Lane'),
          // lane = laneShape.businessObject,
          participantShape = elementRegistry.get('Participant_Lane'),
          bpmnProcess = participantShape.businessObject.processRef;

      var newTaskShape = modeling.createShape({ type: 'bpmn:Task' }, { x: 250, y: 150 }, laneShape);

      var newTask = newTaskShape.businessObject;

      // when
      commandStack.undo();

      // then
      expect(newTask.$parent).not.to.exist;
      expect(bpmnProcess.flowElements).not.to.contain(newTask);

      // TODO(nre): correctly wire flowNodeRef(s)
      // expect(lane.flowNodeRef).not.to.contain(newTask);
    }));


    it('redo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var laneShape = elementRegistry.get('Lane'),
          // lane = laneShape.businessObject,
          participantShape = elementRegistry.get('Participant_Lane'),
          bpmnProcess = participantShape.businessObject.processRef;

      var newTaskShape = modeling.createShape({ type: 'bpmn:Task' }, { x: 250, y: 150 }, laneShape);

      var newTask = newTaskShape.businessObject;

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(newTask.$parent).to.equal(bpmnProcess);
      expect(bpmnProcess.flowElements).to.contain(newTask);

      // TODO(nre): correctly wire flowNodeRef(s)
      // expect(lane.flowNodeRef).to.contain(newTask);
    }));

  });

});
