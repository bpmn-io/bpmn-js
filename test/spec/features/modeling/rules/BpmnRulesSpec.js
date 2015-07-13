'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


function expectCanConnect(source, target, rules) {

  var results = {};

  TestHelper.getBpmnJS().invoke(function(elementRegistry, bpmnRules) {

    source = elementRegistry.get(source);
    target = elementRegistry.get(target);

    expect(source).to.exist;
    expect(target).to.exist;

    if ('sequenceFlow' in rules) {
      results.sequenceFlow = bpmnRules.canConnectSequenceFlow(source, target);
    }

    if ('messageFlow' in rules) {
      results.messageFlow = bpmnRules.canConnectMessageFlow(source, target);
    }

    if ('association' in rules) {
      results.association = bpmnRules.canConnectAssociation(source, target);
    }
  });

  expect(results).to.eql(rules);
}


function expectCanDrop(element, target, expectedResult) {

  var result;

  TestHelper.getBpmnJS().invoke(function(elementRegistry, bpmnRules) {

    element = elementRegistry.get(element);
    target = elementRegistry.get(target);

    expect(element).to.exist;
    expect(target).to.exist;

    result = bpmnRules.canDrop(element, target);
  });

  expect(result).to.eql(expectedResult);
}


function expectCanExecute(elements, target, rules) {

  var results = {};

  TestHelper.getBpmnJS().invoke(function(elementRegistry, bpmnRules) {

    target = elementRegistry.get(target);

    if ('canAttach' in rules) {
      results.canAttach = bpmnRules.canAttach(elements, target);
    }

    if ('canMove' in rules) {
      results.canMove = bpmnRules.canMove(elements, target);
    }
  });

  expect(results).to.eql(rules);
}


describe('features/modeling/rules - BpmnRules', function() {

  var testModules = [ coreModule, modelingModule ];


  describe('on process diagram', function() {

    var testXML = require('./BpmnRules.process.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('connect StartEvent_None -> Task', inject(function() {

      expectCanConnect('StartEvent_None', 'Task', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect StartEvent_None -> TextAnnotation', inject(function() {

      expectCanConnect('StartEvent_None', 'TextAnnotation', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect Task -> IntermediateThrowEvent_Link', inject(function() {

      expectCanConnect('Task', 'IntermediateThrowEvent_Link', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect IntermediateThrowEvent_Link -> EndEvent_None', inject(function() {

      expectCanConnect('IntermediateThrowEvent_Link', 'EndEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect StartEvent_None -> IntermediateCatchEvent_Link', inject(function() {

      expectCanConnect('StartEvent_None', 'IntermediateCatchEvent_Link', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect IntermediateCatchEvent_Link -> Task', inject(function() {

      expectCanConnect('IntermediateCatchEvent_Link', 'Task', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect BoundaryEvent -> Task', inject(function() {

      expectCanConnect('BoundaryEvent', 'Task', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect BoundaryEvent_1 -> SubProcess', inject(function() {

      expectCanConnect('BoundaryEvent', 'SubProcess', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect BoundaryEvent -> BoundaryEvent_1', inject(function() {

      expectCanConnect('BoundaryEvent', 'BoundaryEvent_1', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect BoundaryEvent -> StartEvent_None', inject(function() {

      expectCanConnect('BoundaryEvent', 'BoundaryEvent_1', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect StartEvent_None -> BoundaryEvent', inject(function() {

      expectCanConnect('StartEvent_None', 'BoundaryEvent', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('drop TextAnnotation -> Process', inject(function() {

      expectCanDrop('TextAnnotation', 'Process', true);
    }));

  });


  describe('event based gateway', function() {

    var testXML = require('./BpmnRules.eventBasedGateway.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('connect EventBasedGateway -> IntermediateCatchEvent_Message', inject(function() {

      expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Message', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> IntermediateCatchEvent_Message', inject(function() {

      expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Message', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> IntermediateCatchEvent_Signal', inject(function() {

      expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Signal', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> IntermediateCatchEvent_Condition', inject(function() {

      expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Condition', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> IntermediateCatchEvent_Timer', inject(function() {

      expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Timer', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> IntermediateCatchEvent', inject(function() {

      expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> IntermediateThrowEvent_Message', inject(function() {

      expectCanConnect('EventBasedGateway', 'IntermediateThrowEvent_Message', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> ReceiveTask', inject(function() {

      expectCanConnect('EventBasedGateway', 'ReceiveTask', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> Task_None', inject(function() {

      expectCanConnect('EventBasedGateway', 'Task_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> ParallelGateway', inject(function() {

      expectCanConnect('EventBasedGateway', 'ParallelGateway', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> ParallelGateway', inject(function() {

      expectCanConnect('EventBasedGateway', 'ParallelGateway', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));

  });


  describe('on collaboration diagram', function() {

    var testXML = require('./BpmnRules.collaboration.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('connect StartEvent_None -> IntermediateEvent', inject(function() {

      expectCanConnect('StartEvent_None', 'IntermediateThrowEvent_Message', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect StartEvent_None -> OtherParticipant', inject(function() {

      expectCanConnect('StartEvent_None', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect OtherParticipant -> StartEvent_None', inject(function() {

      expectCanConnect('OtherParticipant', 'StartEvent_None', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });

    }));


    it('connect OtherParticipant -> StartEvent_Timer', inject(function() {

      expectCanConnect('OtherParticipant', 'StartEvent_Timer', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });

    }));


    it('connect OtherParticipant -> StartEvent_Message', inject(function() {

      expectCanConnect('OtherParticipant', 'StartEvent_Message', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });

    }));


    it('connect EndEvent_None -> OtherParticipant', inject(function() {

      expectCanConnect('EndEvent_None', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });
    }));


    it('connect EndEvent_Cancel -> OtherParticipant', inject(function() {

      expectCanConnect('EndEvent_Cancel', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EndEvent_Message -> OtherParticipant', inject(function() {

      expectCanConnect('EndEvent_Message', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });
    }));


    it('connect OtherParticipant -> EndEvent_None', inject(function() {

      expectCanConnect('OtherParticipant', 'EndEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect IntermediateThrowEvent_Message -> OtherParticipant', inject(function() {

      expectCanConnect('IntermediateThrowEvent_Message', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });
    }));


    it('connect IntermediateThrowEvent_None -> OtherParticipant', inject(function() {

      expectCanConnect('IntermediateThrowEvent_None', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });
    }));


    it('connect IntermediateThrowEvent_Signal -> OtherParticipant', inject(function() {

      expectCanConnect('IntermediateThrowEvent_Signal', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect OtherParticipant -> IntermediateThrowEvent_Message', inject(function() {

      expectCanConnect('OtherParticipant', 'IntermediateThrowEvent_Message', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect Task_in_SubProcess -> OtherParticipant', inject(function() {

      expectCanConnect('Task_in_SubProcess', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });
    }));


    it('connect EndEvent_None_in_SubProcess -> OtherParticipant', inject(function() {

      expectCanConnect('EndEvent_None_in_SubProcess', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });
    }));


    it('connect OtherParticipant -> Task_in_SubProcess', inject(function() {

      expectCanConnect('OtherParticipant', 'Task_in_SubProcess', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });
    }));


    it('connect Participant -> OtherParticipant', inject(function() {

      expectCanConnect('Participant', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });
    }));


    it('connect StartEvent_None -> TextAnnotation_OtherParticipant', inject(function() {

      expectCanConnect('StartEvent_None', 'TextAnnotation_OtherParticipant', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect BoundaryEvent -> Task_in_OtherParticipant', inject(function() {

      expectCanConnect('BoundaryEvent', 'Task_in_OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });
    }));


    it('drop TextAnnotation_Global -> Participant', inject(function() {

      expectCanDrop('TextAnnotation_Global', 'Participant', true);
    }));

  });


  describe('message flows', function() {

    var testXML = require('./BpmnRules.messageFlow.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('drop MessageFlow -> Collaboration', inject(function() {

      expectCanDrop('MessageFlow', 'Collaboration', true);
    }));

  });


  describe('event move', function() {

    var testXML = require('../../../../fixtures/bpmn/boundary-events.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('attach/move BoundaryEvent -> Process', inject(function(elementRegistry) {

      // when
      var boundaryEvent = elementRegistry.get('BoundaryEvent_1');

      var elements = [ boundaryEvent ];

      // then
      expectCanExecute(elements, 'Process_1', {
        canAttach: false,
        canMove: false
      });

    }));


    it('attach/move BoundaryEvent -> Task', inject(function(elementRegistry) {

      // when
      var boundaryEvent = elementRegistry.get('BoundaryEvent_1');

      var elements = [ boundaryEvent ];

      // then
      expectCanExecute(elements, 'Task_2', {
        canAttach: 'attach',
        canMove: false
      });

    }));


    it('attach/move BoundaryEvent label -> SubProcess', inject(function(elementRegistry) {

      // when
      var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
          label = boundaryEvent.label;

      var elements = [ label ];

      // then
      expectCanExecute(elements, 'SubProcess_1', {
        canAttach: false,
        canMove: true
      });

    }));


    it('attach/move multiple BoundaryEvents -> SubProcess_1', inject(function (elementRegistry) {
      // when
      var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
          boundaryEvent2 = elementRegistry.get('BoundaryEvent_2');

      // we assume boundary events and labels
      // to be already filtered during move
      var elements = [ boundaryEvent, boundaryEvent2 ];

      // then
      expectCanExecute(elements, 'SubProcess_1', {
        canAttach: false,
        canMove: false
      });
    }));


    it('attach/move SubProcess, BoundaryEvent and label -> Process', inject(function (elementRegistry) {
      // when
      var subProcess = elementRegistry.get('SubProcess_1'),
          boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
          label = boundaryEvent.label;

      // we assume boundary events and labels
      // to be already filtered during move
      var elements = [ subProcess, boundaryEvent, label ];

      // then
      expectCanExecute(elements, 'Process_1', {
        canAttach: false,
        canMove: false
      });
    }));

  });


  describe('event create', function() {

    var testXML = require('../../../../fixtures/bpmn/boundary-events.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('attach IntermediateEvent to Task', inject(function(elementFactory, bpmnRules) {

      // given
      var eventShape = elementFactory.createShape({
        type: 'bpmn:IntermediateThrowEvent',
        x: 413, y: 254
      });

      // then
      expectCanExecute([ eventShape ], 'Task_1', {
        canAttach: 'attach',
        canMove: false
      });
    }));


    it('attach IntermediateEvent to SubProcess border', inject(function(elementFactory, elementRegistry, bpmnRules) {

      // given
      var subProcessElement = elementRegistry.get('SubProcess_1');
      var eventShape = elementFactory.createShape({
        type: 'bpmn:IntermediateThrowEvent',
        x: 413, y: 350
      });

      var position = {
        x: eventShape.x,
        y: eventShape.y
      };

      // when
      var canAttach = bpmnRules.canAttach([ eventShape ], subProcessElement, null, position);

      // then
      expect(canAttach).to.equal('attach');
    }));


    it('create IntermediateEvent in SubProcess body', inject(function(elementFactory, elementRegistry, bpmnRules) {

      // given
      var subProcessElement = elementRegistry.get('SubProcess_1');
      var eventShape = elementFactory.createShape({
        type: 'bpmn:IntermediateThrowEvent',
        x: 413, y: 250
      });

      var position = {
        x: eventShape.x,
        y: eventShape.y
      };

      // when
      var canAttach = bpmnRules.canAttach([ eventShape ], subProcessElement, null, position),
          canCreate = bpmnRules.canCreate(eventShape, subProcessElement, null, position);

      // then
      expect(canAttach).to.equal(false);
      expect(canCreate).to.equal(true);
    }));

  });


  describe('event append', function() {

    var testXML = require('../../../../fixtures/bpmn/boundary-events.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('append IntermediateEvent from Task', inject(function(elementFactory, elementRegistry, bpmnRules) {

      // given
      var subProcessElement = elementRegistry.get('SubProcess_1'),
          taskElement = elementRegistry.get('Task_2');

      var eventShape = elementFactory.createShape({
        type: 'bpmn:IntermediateThrowEvent',
        x: 413, y: 250
      });

      var position = {
        x: eventShape.x,
        y: eventShape.y
      };

      // when
      var canAttach = bpmnRules.canAttach([ eventShape ], subProcessElement, taskElement, position),
          canCreate = bpmnRules.canCreate(eventShape, subProcessElement, taskElement, position);

      // then
      expect(canAttach).to.equal(false);
      expect(canCreate).to.equal(true);
    }));


    it('append IntermediateEvent from BoundaryEvent', inject(function(elementFactory, elementRegistry, bpmnRules) {

      // given
      var boundaryElement = elementRegistry.get('BoundaryEvent_1'),
          taskElement = elementRegistry.get('Task_2');

      var eventShape = elementFactory.createShape({
        type: 'bpmn:IntermediateThrowEvent',
        x: 413, y: 250
      });

      // when
      var canAttach = bpmnRules.canAttach([ eventShape ], taskElement, boundaryElement),
          canCreate = bpmnRules.canCreate(eventShape, taskElement, boundaryElement);

      // then
      expect(canAttach).to.equal(false);
      expect(canCreate).to.equal(false);
    }));

  });

});
