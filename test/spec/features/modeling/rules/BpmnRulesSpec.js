'use strict';

var Helper = require('./Helper');

var expectCanConnect = Helper.expectCanConnect,
    expectCanDrop = Helper.expectCanDrop,
    expectCanMove = Helper.expectCanMove;

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


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


    it('drop TextAnnotation -> Process', inject(function() {

      expectCanDrop('TextAnnotation', 'Process', true);
    }));

  });


  describe('boundary events', function() {

    var testXML = require('./BpmnRules.boundaryEvent.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('connect BoundaryEvent_on_SubProcess -> Task', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'Task', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> ExclusiveGateway', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'ExclusiveGateway', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> SubProcess', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'SubProcess', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> BoundaryEvent_on_Task', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'BoundaryEvent_on_Task', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> StartEvent_None', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'StartEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect StartEvent_None -> BoundaryEvent_on_SubProcess', inject(function() {

      expectCanConnect('StartEvent_None', 'BoundaryEvent_on_SubProcess', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect BoundaryEvent_nested -> Task', inject(function() {

      expectCanConnect('BoundaryEvent_nested', 'Task', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect BoundaryEvent_nested -> EndEvent_nested', inject(function() {

      expectCanConnect('BoundaryEvent_nested', 'EndEvent_nested', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> BoundaryEvent_in_OtherProcess', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'BoundaryEvent_in_OtherProcess', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> Task_in_OtherProcess', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'Task_in_OtherProcess', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect Task_in_OtherProcess -> BoundaryEvent_on_SubProcess', inject(function() {

      expectCanConnect('Task_in_OtherProcess', 'BoundaryEvent_on_SubProcess', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });
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
      expectCanMove(elements, 'Process_1', {
        attach: false,
        move: false
      });

    }));


    it('attach/move BoundaryEvent -> Task', inject(function(elementRegistry) {

      // when
      var boundaryEvent = elementRegistry.get('BoundaryEvent_1');

      var elements = [ boundaryEvent ];

      // then
      expectCanMove(elements, 'Task_2', {
        attach: 'attach',
        move: false
      });

    }));


    it('attach/move BoundaryEvent label -> SubProcess', inject(function(elementRegistry) {

      // when
      var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
          label = boundaryEvent.label;

      var elements = [ label ];

      // then
      expectCanMove(elements, 'SubProcess_1', {
        attach: false,
        move: true
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
      expectCanMove(elements, 'SubProcess_1', {
        attach: false,
        move: false
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
      expectCanMove(elements, 'Process_1', {
        attach: false,
        move: false
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
      expectCanMove([ eventShape ], 'Task_1', {
        attach: 'attach',
        move: false
      });
    }));


    it('attach IntermediateEvent to SubProcess inner', inject(function(elementFactory, elementRegistry, bpmnRules) {

      // given
      var subProcessElement = elementRegistry.get('SubProcess_1');
      var eventShape = elementFactory.createShape({
        type: 'bpmn:IntermediateThrowEvent',
        x: 413, y: 350
      });

      var position = {
        x: subProcessElement.x + subProcessElement.width / 2,
        y: subProcessElement.y + subProcessElement.height / 2
      };

      // when
      var canAttach = bpmnRules.canAttach([ eventShape ], subProcessElement, null, position);

      // then
      expect(canAttach).to.equal(false);
    }));


    it('attach IntermediateEvent to SubProcess border', inject(function(elementFactory, elementRegistry, bpmnRules) {

      // given
      var subProcessElement = elementRegistry.get('SubProcess_1');
      var eventShape = elementFactory.createShape({
        type: 'bpmn:IntermediateThrowEvent',
        x: 0, y: 0
      });

      var position = {
        x: subProcessElement.x + subProcessElement.width / 2,
        y: subProcessElement.y + subProcessElement.height
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
