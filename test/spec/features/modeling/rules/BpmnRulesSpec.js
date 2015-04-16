'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */


var rulesModule = require('../../../../../lib/features/modeling/rules'),
    coreModule = require('../../../../../lib/core');


function expectCanConnect(source, target, rules) {

  var results = {};

  TestHelper.getBpmnJS().invoke(function(elementRegistry, bpmnRules) {

    source = elementRegistry.get(source);
    target = elementRegistry.get(target);

    expect(source).toBeDefined();
    expect(target).toBeDefined();

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

  expect(results).toEqual(rules);
}


function expectCanDrop(element, target, expectedResult) {

  var result;

  TestHelper.getBpmnJS().invoke(function(elementRegistry, bpmnRules) {

    element = elementRegistry.get(element);
    target = elementRegistry.get(target);

    expect(element).toBeDefined();
    expect(target).toBeDefined();

    result = bpmnRules.canDrop(element, target);
  });

  expect(result).toEqual(expectedResult);
}


describe('features/modeling/rules - BpmnRules', function() {

  var testModules = [ coreModule, rulesModule ];


  describe('on process diagram', function() {

    var testXML = require('./BpmnRules.process.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('connect StartEvent_None -> Task', inject(function(bpmnRules) {

      expectCanConnect('StartEvent_None', 'Task', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect StartEvent_None -> TextAnnotation', inject(function(bpmnRules) {

      expectCanConnect('StartEvent_None', 'TextAnnotation', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect Task -> IntermediateThrowEvent_Link', inject(function(bpmnRules) {

      expectCanConnect('Task', 'IntermediateThrowEvent_Link', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect IntermediateThrowEvent_Link -> EndEvent_None', inject(function(bpmnRules) {

      expectCanConnect('IntermediateThrowEvent_Link', 'EndEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect StartEvent_None -> IntermediateCatchEvent_Link', inject(function(bpmnRules) {

      expectCanConnect('StartEvent_None', 'IntermediateCatchEvent_Link', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect IntermediateCatchEvent_Link -> ', inject(function(bpmnRules) {

      expectCanConnect('IntermediateCatchEvent_Link', 'Task', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('drop TextAnnotation -> Process', inject(function(bpmnRules) {

      expectCanDrop('TextAnnotation', 'Process', true);
    }));

  });


  describe('event based gateway', function() {

    var testXML = require('./BpmnRules.eventBasedGateway.bpmn');

    beforeEach(bootstrapModeler(testXML, { modules: testModules }));


    it('connect EventBasedGateway -> IntermediateCatchEvent_Message', inject(function(bpmnRules) {

      expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Message', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> IntermediateCatchEvent_Message', inject(function(bpmnRules) {

      expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Message', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> IntermediateCatchEvent_Signal', inject(function(bpmnRules) {

      expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Signal', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> IntermediateCatchEvent_Condition', inject(function(bpmnRules) {

      expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Condition', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> IntermediateCatchEvent_Timer', inject(function(bpmnRules) {

      expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent_Timer', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> IntermediateCatchEvent', inject(function(bpmnRules) {

      expectCanConnect('EventBasedGateway', 'IntermediateCatchEvent', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> IntermediateThrowEvent_Message', inject(function(bpmnRules) {

      expectCanConnect('EventBasedGateway', 'IntermediateThrowEvent_Message', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> ReceiveTask', inject(function(bpmnRules) {

      expectCanConnect('EventBasedGateway', 'ReceiveTask', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> Task_None', inject(function(bpmnRules) {

      expectCanConnect('EventBasedGateway', 'Task_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect EventBasedGateway -> ParallelGateway', inject(function(bpmnRules) {

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


    it('connect StartEvent_None -> IntermediateEvent', inject(function(bpmnRules) {

      expectCanConnect('StartEvent_None', 'IntermediateThrowEvent_Message', {
        sequenceFlow: true,
        messageFlow: false,
        association: true
      });
    }));


    it('connect StartEvent_None -> OtherParticipant', inject(function(bpmnRules) {

      expectCanConnect('StartEvent_None', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect OtherParticipant -> StartEvent_None', inject(function(bpmnRules) {

      expectCanConnect('OtherParticipant', 'StartEvent_None', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });

    }));


    it('connect EndEvent_None -> OtherParticipant', inject(function(bpmnRules) {

      expectCanConnect('EndEvent_None', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });
    }));


    it('connect OtherParticipant -> EndEvent_None', inject(function(bpmnRules) {

      expectCanConnect('OtherParticipant', 'EndEvent_None', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect IntermediateThrowEvent_Message -> OtherParticipant', inject(function(bpmnRules) {

      expectCanConnect('IntermediateThrowEvent_Message', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });
    }));


    it('connect OtherParticipant -> IntermediateThrowEvent_Message', inject(function(bpmnRules) {

      expectCanConnect('OtherParticipant', 'IntermediateThrowEvent_Message', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect Task_in_SubProcess -> OtherParticipant', inject(function(bpmnRules) {

      expectCanConnect('Task_in_SubProcess', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });
    }));


    it('connect OtherParticipant -> Task_in_SubProcess', inject(function(bpmnRules) {

      expectCanConnect('OtherParticipant', 'Task_in_SubProcess', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });
    }));


    it('connect Participant -> OtherParticipant', inject(function(bpmnRules) {

      expectCanConnect('Participant', 'OtherParticipant', {
        sequenceFlow: false,
        messageFlow: true,
        association: true
      });
    }));


    it('connect StartEvent_None -> TextAnnotation_OtherParticipant', inject(function(bpmnRules) {

      expectCanConnect('StartEvent_None', 'TextAnnotation_OtherParticipant', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('connect StartEvent_None -> TextAnnotation_Global', inject(function(bpmnRules) {

      expectCanConnect('StartEvent_None', 'TextAnnotation_Global', {
        sequenceFlow: false,
        messageFlow: false,
        association: true
      });
    }));


    it('drop TextAnnotation_Global -> Participant', inject(function(bpmnRules) {

      expectCanDrop('TextAnnotation_Global', 'Participant', true);
    }));

  });

});