'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - lanes - flowNodeRefs', function() {

  var diagramXML = require('./flowNodeRefs.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('should unwire during move', function() {

    it('execute', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_A'),
          task = taskShape.businessObject,
          sourceLaneShape = elementRegistry.get('Lane'),
          sourceLane = sourceLaneShape.businessObject,
          targetParticipantShape = elementRegistry.get('Participant_B');

      // when
      modeling.moveElements([ taskShape ], { x: 0, y: +200 }, targetParticipantShape);

      // then
      expect(sourceLane.flowNodeRef).not.to.contain(task);
    }));


    it('undo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_A'),
          task = taskShape.businessObject,
          sourceLaneShape = elementRegistry.get('Lane'),
          sourceLane = sourceLaneShape.businessObject,
          targetParticipantShape = elementRegistry.get('Participant_B');

      modeling.moveElements([ taskShape ], { x: 0, y: +200 }, targetParticipantShape);

      // when
      commandStack.undo();

      // then
      expect(sourceLane.flowNodeRef).to.contain(task);
    }));


    it('redo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_A'),
          task = taskShape.businessObject,
          sourceLaneShape = elementRegistry.get('Lane'),
          sourceLane = sourceLaneShape.businessObject,
          targetParticipantShape = elementRegistry.get('Participant_B');

      modeling.moveElements([ taskShape ], { x: 0, y: +200 }, targetParticipantShape);

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(sourceLane.flowNodeRef).to.not.contain(task);
    }));

  });


  describe('should wire during move', function() {

    it('execute', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_B'),
          task = taskShape.businessObject,
          targetLaneShape = elementRegistry.get('Lane'),
          targetLane = targetLaneShape.businessObject;

      // when
      modeling.moveElements([ taskShape ], { x: 0, y: -200 }, targetLaneShape);

      // then
      expect(targetLane.flowNodeRef).to.contain(task);
    }));


    it('undo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_B'),
          task = taskShape.businessObject,
          targetLaneShape = elementRegistry.get('Lane'),
          targetLane = targetLaneShape.businessObject;

      modeling.moveElements([ taskShape ], { x: 0, y: -200 }, targetLaneShape);

      // when
      commandStack.undo();

      // then
      expect(targetLane.flowNodeRef).not.to.contain(task);
    }));


    it('redo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_B'),
          task = taskShape.businessObject,
          targetLaneShape = elementRegistry.get('Lane'),
          targetLane = targetLaneShape.businessObject;

      modeling.moveElements([ taskShape ], { x: 0, y: -200 }, targetLaneShape);

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(targetLane.flowNodeRef).to.contain(task);
    }));

  });


  describe('should unwire during delete', function() {

    it('execute', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_A'),
          task = taskShape.businessObject,
          parentLaneShape = elementRegistry.get('Lane'),
          parentLane = parentLaneShape.businessObject;

      // when
      modeling.removeElements([ taskShape ]);

      // then
      expect(parentLane.flowNodeRef).not.to.contain(task);
    }));


    it('undo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_A'),
          task = taskShape.businessObject,
          parentLaneShape = elementRegistry.get('Lane'),
          parentLane = parentLaneShape.businessObject;

      modeling.removeElements([ taskShape ]);

      // when
      commandStack.undo();

      // then
      expect(parentLane.flowNodeRef).to.contain(task);
    }));


    it('redo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_A'),
          task = taskShape.businessObject,
          parentLaneShape = elementRegistry.get('Lane'),
          parentLane = parentLaneShape.businessObject;

      modeling.removeElements([ taskShape ]);

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(parentLane.flowNodeRef).not.to.contain(task);
    }));

  });


  describe('should wire during create', function() {

    it('execute', inject(function(elementRegistry, modeling) {

      // given
      var taskShape, task,
          parentLaneShape = elementRegistry.get('Lane'),
          parentLane = parentLaneShape.businessObject;

      // when
      taskShape = modeling.createShape({ type: 'bpmn:Task' }, { x: 200, y: 300 }, parentLaneShape);
      task = taskShape.businessObject;

      // then
      expect(parentLane.flowNodeRef).to.contain(task);
    }));


    it('undo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape, task,
          parentLaneShape = elementRegistry.get('Lane'),
          parentLane = parentLaneShape.businessObject;

      taskShape = modeling.createShape({ type: 'bpmn:Task' }, { x: 200, y: 300 }, parentLaneShape);
      task = taskShape.businessObject;

      // when
      commandStack.undo();

      // then
      expect(parentLane.flowNodeRef).not.to.contain(task);
    }));


    it('redo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape, task,
          parentLaneShape = elementRegistry.get('Lane'),
          parentLane = parentLaneShape.businessObject;

      taskShape = modeling.createShape({ type: 'bpmn:Task' }, { x: 200, y: 300 }, parentLaneShape);
      task = taskShape.businessObject;

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(parentLane.flowNodeRef).to.contain(task);
    }));

  });


  it('should unwire moving multiple', inject(function(elementRegistry, modeling) {

    // given
    var taskShape = elementRegistry.get('Task_A'),
        task = taskShape.businessObject,
        eventShape = elementRegistry.get('Event'),
        event = eventShape.businessObject,
        targetParticipantShape = elementRegistry.get('Participant_B'),
        sourceLaneShape = elementRegistry.get('Lane'),
        sourceLane = sourceLaneShape.businessObject;

    // when
    modeling.moveElements([ taskShape, eventShape ], { x: 0, y: +200 }, targetParticipantShape);

    // then
    expect(sourceLane.flowNodeRef).not.to.contain(task);
    expect(sourceLane.flowNodeRef).not.to.contain(event);
  }));

});
