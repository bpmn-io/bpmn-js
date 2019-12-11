import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';
import copyPasteModule from 'lib/features/copy-paste';

import {
  find
} from 'min-dash';

/* global sinon */


describe('features/modeling - lanes - flowNodeRefs', function() {

  var diagramXML = require('./UpdateFlowNodeRefs.basic.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule,
      copyPasteModule
    ]
  }));


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
      expect(sourceLane.flowNodeRef).not.to.contain(task);
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
      taskShape = modeling.createShape({ type: 'bpmn:Task' }, { x: 500, y: 150 }, parentLaneShape);
      task = taskShape.businessObject;

      // then
      expect(parentLane.flowNodeRef).to.contain(task);
    }));


    it('undo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape, task,
          parentLaneShape = elementRegistry.get('Lane'),
          parentLane = parentLaneShape.businessObject;

      taskShape = modeling.createShape({ type: 'bpmn:Task' }, { x: 500, y: 150 }, parentLaneShape);
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

      taskShape = modeling.createShape({ type: 'bpmn:Task' }, { x: 500, y: 150 }, parentLaneShape);
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


  it('should not create duplicate refs on attaching / detaching', inject(function(elementRegistry, modeling) {

    // given
    var eventID = 'IntermediateThrowEvent',
        throwEvent = elementRegistry.get(eventID),
        task1 = elementRegistry.get('Task_C'),
        task2 = elementRegistry.get('Task_D'),
        lane1 = elementRegistry.get('Participant_C_Lane_1').businessObject,
        lane2 = elementRegistry.get('Participant_C_Lane_2').businessObject;

    // when
    modeling.moveElements([ throwEvent ], { x: -280, y: 30 }, task1, { attach: true });

    var boundaryEvent = elementRegistry.get(eventID);

    modeling.moveElements([ boundaryEvent ], { x: 0, y: 150 }, task2, { attach: true });

    // then
    expect(lane1.flowNodeRef).not.to.contain(boundaryEvent.businessObject);
    expect(lane2.flowNodeRef).to.contain(boundaryEvent.businessObject);
    expect(lane1.flowNodeRef).to.have.length(1);
    expect(lane2.flowNodeRef).to.have.length(2);
  }));


  describe('should wire once during paste', function() {

    it('execute', inject(function(canvas, eventBus, elementRegistry, copyPaste) {

      // given
      var participant = elementRegistry.get('Participant_D');

      var updateRefsSpy = sinon.spy();

      eventBus.on('commandStack.lane.updateRefs.execute', updateRefsSpy);

      // when
      copyPaste.copy(participant);

      var pastedElements = copyPaste.paste({
        element: canvas.getRootElement(),
        point: {
          x: 350,
          y: 150
        }
      });

      var pastedLane = find(pastedElements, function(e) {
        return e.businessObject.name === 'Lane_D_1_1';
      });

      var pastedTask = find(pastedElements, function(e) {
        return e.businessObject.name === 'Task_E';
      });

      // then
      expect(updateRefsSpy).to.have.been.calledOnce;

      expect(pastedLane.businessObject.flowNodeRef).to.include(pastedTask.businessObject);
    }));

  });

});
