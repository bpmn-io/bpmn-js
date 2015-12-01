'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var is = require('../../../../../lib/util/ModelUtil').is,
    find = require('lodash/collection/find');

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


function getConnection(source, target, connectionOrType) {
  return find(source.outgoing, function(c) {
    return c.target === target &&
      (typeof connectionOrType === 'string' ? is(c, connectionOrType) : c === connectionOrType);
  });
}

function expectConnected(source, target, connectionOrType) {
  expect(getConnection(source, target, connectionOrType)).to.exist;
}

function expectNotConnected(source, target, connectionOrType) {
  expect(getConnection(source, target, connectionOrType)).not.to.exist;
}


describe('features/modeling - replace connection', function() {

  var testModules = [ coreModule, modelingModule ];


  describe('should replace SequenceFlow <> MessageFlow', function() {

    var processDiagramXML = require('./ReplaceConnectionBehavior.message-sequence-flow.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

    var element;

    beforeEach(inject(function(elementRegistry) {
      element = function(id) {
        return elementRegistry.get(id);
      };
    }));

    describe('after reconnecting', function(){

      it('sequence flow to another task', inject(function(elementRegistry, modeling){

        // given
        var task4Shape = element('Task_4');
        var connection = element('SequenceFlow_1');

        var newWaypoints = [ connection.waypoints[0], { x: task4Shape.x + 30, y: task4Shape.y }];

        // when
        modeling.reconnectEnd(connection, task4Shape, newWaypoints);

        // then
        expectConnected(element('Task_2'), task4Shape, 'bpmn:MessageFlow');
      }));


      it('message flow to another task', inject(function(elementRegistry, modeling){

        // given
        var task4Shape = element('Task_4');
        var connection = element('MessageFlow_1');

        var newWaypoints = [ connection.waypoints[0], { x: task4Shape.x, y: task4Shape.y + 20 } ];

        // when
        modeling.reconnectEnd(connection, task4Shape, newWaypoints);

        // then
        expectConnected(element('Task_3'), task4Shape, 'bpmn:SequenceFlow');
      }));


      it('sequence flow to a participant', inject(function(elementRegistry, modeling){

        // given
        var participant2 = element('Participant_2');
        var connection = element('SequenceFlow_1');

        var newWaypoints = [ connection.waypoints[0], { x: participant2.x, y: participant2.y }];

        // when
        modeling.reconnectEnd(connection, participant2, newWaypoints);

        // then
        expectConnected(element('Task_2'), participant2, 'bpmn:MessageFlow');
      }));


      it('sequence flow from a participant', inject(function(elementRegistry, modeling){

        // given
        var participant2 = element('Participant_2'),
            subProcess1 = element('SubProcess_1'),
            connection = element('SequenceFlow_1');

        var newWaypoints = [
          { x: participant2.x + 200, y: participant2.y },
          { x: subProcess1.x, y: subProcess1.y + 50 }
        ];

        // when
        modeling.reconnectStart(connection, participant2, newWaypoints);

        // then
        expectConnected(participant2, subProcess1, 'bpmn:MessageFlow');
      }));

    });

    describe('moving single shape', function() {

      it('execute', inject(function(modeling, elementRegistry) {

        // given
        var taskShape = element('Task_2'),
            targetShape = element('Participant_2');

        // when
        modeling.moveElements([ taskShape ], { x: 0, y: 330 }, targetShape);

        // then
        expect(taskShape.parent).to.eql(targetShape);

        expectNotConnected(element('StartEvent_1'), taskShape, 'bpmn:SequenceFlow');

        expectConnected(taskShape, element('Task_4'), 'bpmn:SequenceFlow');
        expectConnected(taskShape, element('SubProcess_1'), 'bpmn:MessageFlow');
      }));


      it('undo', inject(function(modeling, elementRegistry, commandStack) {

        // given
        var taskShape = element('Task_2'),
            targetShape = element('Participant_2'),
            oldParent = taskShape.parent;

        modeling.moveElements([ taskShape ], { x: 0, y: 300 }, targetShape);

        // when
        commandStack.undo();

        // then
        expect(taskShape.parent).to.eql(oldParent);

        expectConnected(element('StartEvent_1'), taskShape, element('SequenceFlow_3'));

        expectConnected(taskShape, element('Task_4'), element('MessageFlow_5'));
        expectConnected(taskShape, element('SubProcess_1'), element('SequenceFlow_1'));
      }));

    });


    describe('moving multiple shapes', function() {

      it('execute', inject(function(modeling, elementRegistry) {

        // given
        var startEventShape = element('StartEvent_1'),
            taskShape = element('Task_2'),
            targetShape = element('Participant_2');

        // when
        modeling.moveElements([ startEventShape, taskShape ], { x: 0, y: 330 }, targetShape);

        // then
        expect(taskShape.parent).to.eql(targetShape);
        expect(startEventShape.parent).to.eql(targetShape);

        expectConnected(startEventShape, taskShape, element('SequenceFlow_3'));

        expectNotConnected(element('Participant_2'), startEventShape, 'bpmn:MessageFlow');
        expectConnected(taskShape, element('SubProcess_1'), 'bpmn:MessageFlow');
      }));


      it('undo', inject(function(modeling, elementRegistry, commandStack) {

        // given
        var taskShape = element('Task_2'),
            targetShape = element('Participant_2'),
            oldParent = taskShape.parent;

        modeling.moveElements([ taskShape ], { x: 0, y: 300 }, targetShape);

        // when
        commandStack.undo();

        // then
        expect(taskShape.parent).to.eql(oldParent);

        expectConnected(element('StartEvent_1'), taskShape, element('SequenceFlow_3'));

        expectConnected(taskShape, element('Task_4'), element('MessageFlow_5'));
        expectConnected(taskShape, element('SubProcess_1'), element('SequenceFlow_1'));

        expectConnected(element('Participant_2'), element('StartEvent_1'), element('MessageFlow_4'));
      }));

    });


    describe('moving nested shapes', function() {

      it('execute', inject(function(modeling, elementRegistry) {

        // given
        var subProcessShape = element('SubProcess_1'),
            targetShape = element('Participant_2');

        // when
        modeling.moveElements([ subProcessShape ], { x: 0, y: 530 }, targetShape);

        // then
        expect(subProcessShape.parent).to.eql(targetShape);

        expectConnected(element('Task_2'), subProcessShape, 'bpmn:MessageFlow');

        expectNotConnected(element('Task_1'), element('Participant_2'), 'bpmn:MessageFlow');
      }));


      it('undo', inject(function(modeling, elementRegistry, commandStack) {

        // given
        var subProcessShape = element('SubProcess_1'),
            targetShape = element('Participant_2');

        modeling.moveElements([ subProcessShape ], { x: 0, y: 530 }, targetShape);

        // when
        commandStack.undo();

        // then
        expectConnected(element('Task_2'), subProcessShape, element('SequenceFlow_1'));

        expectConnected(element('Task_1'), element('Participant_2'), element('MessageFlow_3'));
      }));

    });

  });


  describe('should replace SequenceFlow <> MessageFlow', function() {

    var processDiagramXML = require('./ReplaceConnectionBehavior.association.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

    var element;

    beforeEach(inject(function(elementRegistry) {
      element = function(id) {
        return elementRegistry.get(id);
      };
    }));

    describe('moving text-annotation to participant', function() {

      it('execute', inject(function(modeling, elementRegistry) {

        // given
        var textAnnotationShape = element('TextAnnotation_1'),
            targetShape = element('Participant_1');

        // when
        modeling.moveElements([ textAnnotationShape ], { x: -200, y: 40 }, targetShape);

        // then
        expect(textAnnotationShape.parent).to.eql(targetShape);

        expectNotConnected(textAnnotationShape, targetShape, 'bpmn:TextAnnotation');
      }));


      it('undo', inject(function(modeling, elementRegistry, commandStack) {

        // given
        var textAnnotationShape = element('TextAnnotation_1'),
            targetShape = element('Participant_1');

        modeling.moveElements([ textAnnotationShape ], { x: -200, y: 40 }, targetShape);

        // when
        commandStack.undo();

        // then
        expectConnected(textAnnotationShape, targetShape, element('Association_1'));
      }));

    });

  });

  describe('boundary events', function() {

    var processDiagramXML = require('./ReplaceConnectionBehavior.boundary-events.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

    var element;

    beforeEach(inject(function(elementRegistry) {
      element = function(id) {
        return elementRegistry.get(id);
      };
    }));

    describe('moving host', function() {

      it('should remove invalid connections', inject(function(modeling) {

        // given
        var taskShape = element('Task_1'),
            taskShape2 = element('Task_2'),
            targetShape = element('SubProcess_1'),
            boundaryEvent = element('BoundaryEvent_1'),
            sequenceFlow = element('SequenceFlow_1');

        // when
        modeling.moveElements([ taskShape ], { x: 30, y: 200 }, targetShape);

        // then
        expectNotConnected(boundaryEvent, taskShape2 ,sequenceFlow);
      }));


      it('should remove invalid connections (undo)', inject(function(modeling, commandStack) {

        // given
        var taskShape = element('Task_1'),
            taskShape2 = element('Task_2'),
            boundaryEvent = element('BoundaryEvent_1'),
            targetShape = element('SubProcess_1'),
            sequenceFlow = element('SequenceFlow_1');

        // when
        modeling.moveElements([ taskShape ], { x: 30, y: 200 }, targetShape);
        commandStack.undo();

        // then
        expectConnected(boundaryEvent, taskShape2, sequenceFlow);
      }));


      it('should remove invalid connections (redo)', inject(function(modeling, commandStack) {

        // given
        var taskShape = element('Task_1'),
            targetShape = element('SubProcess_1'),
            sequenceFlow = element('SequenceFlow_1');

        // when
        modeling.moveElements([ taskShape ], { x: 30, y: 200 }, targetShape);
        commandStack.undo();
        commandStack.redo();

        // then
        expectNotConnected(taskShape, targetShape, sequenceFlow);
      }));

    });

  });

});
