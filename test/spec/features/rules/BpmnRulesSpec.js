'use strict';

var Helper = require('./Helper');

var expectCanConnect = Helper.expectCanConnect,
    expectCanDrop = Helper.expectCanDrop,
    expectCanMove = Helper.expectCanMove;

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling/rules - BpmnRules', function() {

  var testModules = [ coreModule, modelingModule ];


  describe('on process diagram', function() {

    var testXML = require('./BpmnRules.process.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('connect StartEvent_None -> Task', inject(function() {

      expectCanConnect('StartEvent_None', 'Task', {
        sequenceFlow: true,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect StartEvent_None -> TextAnnotation', inject(function() {

      expectCanConnect('StartEvent_None', 'TextAnnotation', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect Task -> IntermediateThrowEvent_Link', inject(function() {

      expectCanConnect('Task', 'IntermediateThrowEvent_Link', {
        sequenceFlow: true,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect IntermediateThrowEvent_Link -> EndEvent_None', inject(function() {

      expectCanConnect('IntermediateThrowEvent_Link', 'EndEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect StartEvent_None -> IntermediateCatchEvent_Link', inject(function() {

      expectCanConnect('StartEvent_None', 'IntermediateCatchEvent_Link', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect IntermediateCatchEvent_Link -> Task', inject(function() {

      expectCanConnect('IntermediateCatchEvent_Link', 'Task', {
        sequenceFlow: true,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('drop TextAnnotation -> Process', inject(function() {

      expectCanDrop('TextAnnotation', 'Process', true);
    }));


    it('drop TextAnnotation -> SubProcess', inject(function() {

      expectCanDrop('TextAnnotation', 'SubProcess', true);
    }));


    it('drop Start Event -> Collapsed Sub Process', function(){

      expectCanDrop('StartEvent_None', 'CollapsedSubProcess', false);
    });


    it('connect DataObjectReference -> StartEvent_None', inject(function() {

      expectCanConnect('DataObjectReference', 'StartEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect StartEvent_None -> DataObjectReference', inject(function() {

      expectCanConnect('StartEvent_None', 'DataObjectReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataOutputAssociation' }
      });
    }));


    it('connect DataObjectReference -> EndEvent_None', inject(function() {

      expectCanConnect('DataObjectReference', 'EndEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataInputAssociation' }
      });
    }));


    it('connect EndEvent_None -> DataObjectReference', inject(function() {

      expectCanConnect('EndEvent_None', 'DataObjectReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect Task -> DataObjectReference', inject(function() {

      expectCanConnect('Task', 'DataObjectReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataOutputAssociation' }
      });
    }));


    it('connect DataObjectReference -> Task', inject(function() {

      expectCanConnect('DataObjectReference', 'Task', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataInputAssociation' }
      });
    }));


    it('connect SubProcess -> DataObjectReference', inject(function() {

      expectCanConnect('SubProcess', 'DataObjectReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataOutputAssociation' }
      });
    }));


    it('connect DataObjectReference -> SubProcess', inject(function() {

      expectCanConnect('DataObjectReference', 'SubProcess', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataInputAssociation' }
      });
    }));


    it('connect DataStoreReference -> StartEvent_None', inject(function() {

      expectCanConnect('DataStoreReference', 'StartEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect StartEvent_None -> DataStoreReference', inject(function() {

      expectCanConnect('StartEvent_None', 'DataStoreReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataOutputAssociation' }
      });
    }));


    it('connect DataStoreReference -> EndEvent_None', inject(function() {

      expectCanConnect('DataStoreReference', 'EndEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataInputAssociation' }
      });
    }));


    it('connect EndEvent_None -> DataStoreReference', inject(function() {

      expectCanConnect('EndEvent_None', 'DataStoreReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect Task -> DataStoreReference', inject(function() {

      expectCanConnect('Task', 'DataStoreReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataOutputAssociation' }
      });
    }));


    it('connect DataStoreReference -> Task', inject(function() {

      expectCanConnect('DataStoreReference', 'Task', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataInputAssociation' }
      });
    }));


    it('connect SubProcess -> DataStoreReference', inject(function() {

      expectCanConnect('SubProcess', 'DataStoreReference', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataOutputAssociation' }
      });
    }));


    it('connect DataStoreReference -> SubProcess', inject(function() {

      expectCanConnect('DataStoreReference', 'SubProcess', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: { type: 'bpmn:DataInputAssociation' }
      });
    }));

  });


  describe('boundary events', function() {

    var testXML = require('./BpmnRules.boundaryEvent.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('connect BoundaryEvent_on_SubProcess -> Task', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'Task', {
        sequenceFlow: true,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> ExclusiveGateway', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'ExclusiveGateway', {
        sequenceFlow: true,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> SubProcess', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'SubProcess', {
        sequenceFlow: true,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> BoundaryEvent_on_Task', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'BoundaryEvent_on_Task', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> StartEvent_None', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'StartEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect StartEvent_None -> BoundaryEvent_on_SubProcess', inject(function() {

      expectCanConnect('StartEvent_None', 'BoundaryEvent_on_SubProcess', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect BoundaryEvent_nested -> Task', inject(function() {

      expectCanConnect('BoundaryEvent_nested', 'Task', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect BoundaryEvent_nested -> EndEvent_nested', inject(function() {

      expectCanConnect('BoundaryEvent_nested', 'EndEvent_nested', {
        sequenceFlow: true,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> BoundaryEvent_in_OtherProcess', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'BoundaryEvent_in_OtherProcess', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect BoundaryEvent_on_SubProcess -> Task_in_OtherProcess', inject(function() {

      expectCanConnect('BoundaryEvent_on_SubProcess', 'Task_in_OtherProcess', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect Task_in_OtherProcess -> BoundaryEvent_on_SubProcess', inject(function() {

      expectCanConnect('Task_in_OtherProcess', 'BoundaryEvent_on_SubProcess', {
        sequenceFlow: false,
        messageFlow: true,
        association: true,
        dataAssociation: false
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
        association: true,
        dataAssociation: false
      });
    }));


    it('connect EventBasedGateway -> IntermediateCatchEvent_Message', inject(function() {

      expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Message', {
        sequenceFlow: true,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect EventBasedGateway -> IntermediateCatchEvent_Signal', inject(function() {

      expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Signal', {
        sequenceFlow: true,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect EventBasedGateway -> IntermediateCatchEvent_Condition', inject(function() {

      expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Condition', {
        sequenceFlow: true,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect EventBasedGateway -> IntermediateCatchEvent_Timer', inject(function() {

      expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Timer', {
        sequenceFlow: true,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect EventBasedGateway -> IntermediateCatchEvent', inject(function() {

      expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect EventBasedGateway -> IntermediateThrowEvent_Message', inject(function() {

      expectCanConnect('EventBasedGateway', 'IntermediateThrowEvent_Message', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect EventBasedGateway -> ReceiveTask', inject(function() {

      expectCanConnect('EventBasedGateway', 'ReceiveTask', {
        sequenceFlow: true,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect EventBasedGateway -> Task_None', inject(function() {

      expectCanConnect('EventBasedGateway', 'Task_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect EventBasedGateway -> ParallelGateway', inject(function() {

      expectCanConnect('EventBasedGateway', 'ParallelGateway', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect EventBasedGateway -> ParallelGateway', inject(function() {

      expectCanConnect('EventBasedGateway', 'ParallelGateway', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));

  });


  describe('compensation', function() {

    var testXML = require('./BpmnRules.compensation.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('connect CompensationBoundary -> Task', inject(function() {

      expectCanConnect('CompensationBoundary', 'Task', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect CompensationBoundary -> TaskForCompensation', inject(function() {

      expectCanConnect('CompensationBoundary', 'TaskForCompensation', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });

    }));


    it('connect CompensationBoundary -> Gateway', inject(function() {

      expectCanConnect('CompensationBoundary', 'Gateway', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });

    }));


    it('connect CompensationBoundary -> IntermediateEvent', inject(function() {

      expectCanConnect('CompensationBoundary', 'IntermediateEvent', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });

    }));


    it('connect Task -> TaskForCompensation', inject(function() {

      expectCanConnect('Task', 'TaskForCompensation', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });

    }));


    it('connect TaskForCompensation -> Task', inject(function() {

      expectCanConnect('TaskForCompensation', 'Task', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
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
        association: true,
        dataAssociation: false
      });
    }));


    it('connect StartEvent_None -> OtherParticipant', inject(function() {

      expectCanConnect('StartEvent_None', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect OtherParticipant -> StartEvent_None', inject(function() {

      expectCanConnect('OtherParticipant', 'StartEvent_None', {
        sequenceFlow: false,
        messageFlow: true,
        association: true,
        dataAssociation: false
      });

    }));


    it('connect OtherParticipant -> StartEvent_Timer', inject(function() {

      expectCanConnect('OtherParticipant', 'StartEvent_Timer', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });

    }));


    it('connect OtherParticipant -> StartEvent_Message', inject(function() {

      expectCanConnect('OtherParticipant', 'StartEvent_Message', {
        sequenceFlow: false,
        messageFlow: true,
        association: true,
        dataAssociation: false
      });

    }));


    it('connect EndEvent_None -> OtherParticipant', inject(function() {

      expectCanConnect('EndEvent_None', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect EndEvent_Cancel -> OtherParticipant', inject(function() {

      expectCanConnect('EndEvent_Cancel', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect EndEvent_Message -> OtherParticipant', inject(function() {

      expectCanConnect('EndEvent_Message', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect OtherParticipant -> EndEvent_None', inject(function() {

      expectCanConnect('OtherParticipant', 'EndEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect IntermediateThrowEvent_Message -> OtherParticipant', inject(function() {

      expectCanConnect('IntermediateThrowEvent_Message', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect IntermediateThrowEvent_None -> OtherParticipant', inject(function() {

      expectCanConnect('IntermediateThrowEvent_None', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect IntermediateThrowEvent_Signal -> OtherParticipant', inject(function() {

      expectCanConnect('IntermediateThrowEvent_Signal', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect OtherParticipant -> IntermediateThrowEvent_Message', inject(function() {

      expectCanConnect('OtherParticipant', 'IntermediateThrowEvent_Message', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect Task_in_SubProcess -> OtherParticipant', inject(function() {

      expectCanConnect('Task_in_SubProcess', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect EndEvent_None_in_SubProcess -> OtherParticipant', inject(function() {

      expectCanConnect('EndEvent_None_in_SubProcess', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect OtherParticipant -> Task_in_SubProcess', inject(function() {

      expectCanConnect('OtherParticipant', 'Task_in_SubProcess', {
        sequenceFlow: false,
        messageFlow: true,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect Participant -> OtherParticipant', inject(function() {

      expectCanConnect('Participant', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true,
        dataAssociation: false
      });
    }));


    it('connect StartEvent_None -> TextAnnotation_OtherParticipant', inject(function() {

      expectCanConnect('StartEvent_None', 'TextAnnotation_OtherParticipant', {
        sequenceFlow: false,
        messageFlow: false,
        association: true,
        dataAssociation: false
      });
    }));


    it('drop TextAnnotation_Global -> Participant', inject(function() {

      expectCanDrop('TextAnnotation_Global', 'Participant', true);
    }));

    it('drop element -> collapsed Participant', inject(function(canvas){
      expectCanDrop('StartEvent_None', 'CollapsedParticipant', false);
      expectCanDrop('SubProcess', 'CollapsedParticipant', false);
      expectCanDrop('Task_in_SubProcess', 'CollapsedParticipant', false);
      expectCanDrop('TextAnnotation_Global', 'CollapsedParticipant', false);
    }));

  });


  describe('message flows', function() {

    var testXML = require('./BpmnRules.messageFlow.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('drop MessageFlow -> Collaboration', inject(function() {

      expectCanDrop('MessageFlow', 'Collaboration', true);
    }));

  });


  describe('data association move', function() {

    var testXML = require('./BpmnRules.dataAssociation.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('mode selection including data association', inject(function(elementRegistry) {

      // when
      var elements = [
        elementRegistry.get('Task'),
        elementRegistry.get('DataAssociation'),
        elementRegistry.get('DataObjectReference')
      ];

      // then
      expectCanMove(elements, 'Process', {
        attach: false,
        move: true
      });
    }));

  });


  describe('event move', function() {

    var testXML = require('../../../fixtures/bpmn/boundary-events.bpmn');

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

    var testXML = require('../../../fixtures/bpmn/boundary-events.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('attach IntermediateEvent to Task', inject(function(elementFactory) {

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


    it('not attach IntermediateEvent to CompensationTask', inject(function(elementFactory) {

      // given
      var eventShape = elementFactory.createShape({
        type: 'bpmn:IntermediateThrowEvent',
        x: 413, y: 254
      });

      // then
      expectCanMove([ eventShape ], 'CompensationTask', {
        attach: false,
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
      expect(canAttach).to.be.false;
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


    it('not attach IntermediateEvent to compensation activity', inject(function(elementFactory, elementRegistry, bpmnRules) {

      // given
      var compensationTask = elementRegistry.get('CompensationTask');
      var eventShape = elementFactory.createShape({
        type: 'bpmn:IntermediateThrowEvent',
        x: 0, y: 0
      });

      var position = {
        x: compensationTask.x + compensationTask.width / 2,
        y: compensationTask.y + compensationTask.height
      };

      // when
      var canAttach = bpmnRules.canAttach([ eventShape ], compensationTask, null, position);

      // then
      expect(canAttach).to.be.false;
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
      expect(canAttach).to.be.false;
      expect(canCreate).to.be.true;
    }));

  });


  describe('event append', function() {

    var testXML = require('../../../fixtures/bpmn/boundary-events.bpmn');

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
      expect(canAttach).to.be.false;
      expect(canCreate).to.be.true;
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
      expect(canAttach).to.be.false;
      expect(canCreate).to.be.false;
    }));

  });


  describe('lanes', function() {

    var testXML = require('./BpmnRules.collaboration-lanes.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    describe('should add', function() {

      it('Lane -> Participant', inject(function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var participantElement = elementRegistry.get('Participant');

        var laneShape = elementFactory.createShape({
          type: 'bpmn:Lane',
          x: 413, y: 250
        });

        // when
        var canCreate = bpmnRules.canCreate(laneShape, participantElement);

        // then
        expect(canCreate).to.be.true;
      }));


      it('Lane -> Participant_Lane', inject(function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var participantElement = elementRegistry.get('Participant_Lane');

        var laneShape = elementFactory.createShape({
          type: 'bpmn:Lane',
          x: 413, y: 250
        });

        // when
        var canCreate = bpmnRules.canCreate(laneShape, participantElement);

        // then
        expect(canCreate).to.be.true;
      }));


      it('[not] Lane -> SubProcess', inject(function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var subProcessElement = elementRegistry.get('SubProcess');

        var laneShape = elementFactory.createShape({
          type: 'bpmn:Lane',
          x: 413, y: 250
        });

        // when
        var canCreate = bpmnRules.canCreate(laneShape, subProcessElement);

        // then
        expect(canCreate).to.be.false;
      }));

    });


    describe('should not allow move', function() {

      it('Lane -> Participant', inject(function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var participantElement = elementRegistry.get('Participant'),
            laneElement = elementRegistry.get('Lane');

        // when
        var canMove = bpmnRules.canMove([ laneElement ], participantElement);

        // then
        expect(canMove).to.be.false;
      }));


      it('Lane -> SubProcess', inject(function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var subProcessElement = elementRegistry.get('SubProcess'),
            laneElement = elementRegistry.get('Lane');

        // when
        var canMove = bpmnRules.canMove([ laneElement ], subProcessElement);

        // then
        expect(canMove).to.be.false;
      }));

    });


    describe('should resize', function() {

      it('Lane', inject(function(bpmnRules, elementRegistry) {

        // given
        var laneElement = elementRegistry.get('Lane');

        // when
        var canResize = bpmnRules.canResize(laneElement);

        // then
        expect(canResize).to.be.true;
      }));

    });


    describe('should allow drop', function() {

      it('SubProcess -> Lane', inject(function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var element = elementRegistry.get('SubProcess'),
            laneElement = elementRegistry.get('Lane');

        // when
        var canMove = bpmnRules.canMove([ element ], laneElement);

        // then
        expect(canMove).to.be.true;
      }));


      it('Task_in_SubProcess -> Lane', inject(function(elementFactory, elementRegistry, bpmnRules) {

        // given
        var element = elementRegistry.get('Task_in_SubProcess'),
            laneElement = elementRegistry.get('Lane');

        // when
        var canMove = bpmnRules.canMove([ element ], laneElement);

        // then
        expect(canMove).to.be.true;
      }));

    });

  });


  describe('labels', function() {

    var testXML = require('./BpmnRules.process.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('should filter labels', inject(function(elementRegistry, rules) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_None'),
          startEventLabel = startEventShape.label;

      // when
      var allowed = rules.allowed('elements.delete', {
        elements: [ startEventShape, startEventLabel ]
      });

      // then
      expect(allowed).to.eql([ startEventShape ]);
    }));

  });

});
