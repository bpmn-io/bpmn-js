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
  expect(getConnection(source, target, connectionOrType)).toBeDefined();
}

function expectNotConnected(source, target, connectionOrType) {
  expect(getConnection(source, target, connectionOrType)).not.toBeDefined();
}


describe('features/modeling - drop behavior', function() {

  var testModules = [ coreModule, modelingModule ];


  describe('should replace SequenceFlow <> MessageFlow', function() {

    var processDiagramXML = require('./DropBehavior.message-sequence-flow.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));


    var element;

    beforeEach(inject(function(elementRegistry) {
      element = function(id) {
        return elementRegistry.get(id);
      };
    }));


    describe('moving single shape', function() {

      it('execute', inject(function(modeling, elementRegistry) {

        // given
        var taskShape = element('Task_2'),
            targetShape = element('Participant_2');

        // when
        modeling.moveShapes([ taskShape ], { x: 0, y: 330 }, targetShape);

        // then
        expect(taskShape.parent).toBe(targetShape);

        expectNotConnected(element('StartEvent_1'), taskShape, 'bpmn:SequenceFlow');

        expectConnected(taskShape, element('Task_4'), 'bpmn:SequenceFlow');
        expectConnected(taskShape, element('SubProcess_1'), 'bpmn:MessageFlow');
      }));


      it('undo', inject(function(modeling, elementRegistry, commandStack) {

        // given
        var taskShape = element('Task_2'),
            targetShape = element('Participant_2'),
            oldParent = taskShape.parent;

        modeling.moveShapes([ taskShape ], { x: 0, y: 300 }, targetShape);

        // when
        commandStack.undo();

        // then
        expect(taskShape.parent).toBe(oldParent);

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
        modeling.moveShapes([ startEventShape, taskShape ], { x: 0, y: 330 }, targetShape);

        // then
        expect(taskShape.parent).toBe(targetShape);
        expect(startEventShape.parent).toBe(targetShape);

        expectConnected(startEventShape, taskShape, element('SequenceFlow_3'));

        expectNotConnected(element('Participant_2'), startEventShape, 'bpmn:MessageFlow');
        expectConnected(taskShape, element('SubProcess_1'), 'bpmn:MessageFlow');
      }));


      it('undo', inject(function(modeling, elementRegistry, commandStack) {

        // given
        var taskShape = element('Task_2'),
            targetShape = element('Participant_2'),
            oldParent = taskShape.parent;

        modeling.moveShapes([ taskShape ], { x: 0, y: 300 }, targetShape);

        // when
        commandStack.undo();

        // then
        expect(taskShape.parent).toBe(oldParent);

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
        modeling.moveShapes([ subProcessShape ], { x: 0, y: 530 }, targetShape);

        // then
        expect(subProcessShape.parent).toBe(targetShape);

        expectConnected(element('Task_2'), subProcessShape, 'bpmn:MessageFlow');

        expectNotConnected(element('Task_1'), element('Participant_2'), 'bpmn:MessageFlow');
      }));


      it('undo', inject(function(modeling, elementRegistry, commandStack) {

        // given
        var subProcessShape = element('SubProcess_1'),
            targetShape = element('Participant_2');

        modeling.moveShapes([ subProcessShape ], { x: 0, y: 530 }, targetShape);

        // when
        commandStack.undo();

        // then
        expectConnected(element('Task_2'), subProcessShape, element('SequenceFlow_1'));

        expectConnected(element('Task_1'), element('Participant_2'), element('MessageFlow_3'));
      }));

    });

  });


  describe('should replace SequenceFlow <> MessageFlow', function() {

    var processDiagramXML = require('./DropBehavior.association.bpmn');

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
        modeling.moveShapes([ textAnnotationShape ], { x: -200, y: 40 }, targetShape);

        // then
        expect(textAnnotationShape.parent).toBe(targetShape);

        expectNotConnected(textAnnotationShape, targetShape, 'bpmn:TextAnnotation');
      }));


      it('undo', inject(function(modeling, elementRegistry, commandStack) {

        // given
        var textAnnotationShape = element('TextAnnotation_1'),
            targetShape = element('Participant_1');

        modeling.moveShapes([ textAnnotationShape ], { x: -200, y: 40 }, targetShape);

        // when
        commandStack.undo();

        // then
        expectConnected(textAnnotationShape, targetShape, element('Association_1'));
      }));

    });

  });

});