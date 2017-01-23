'use strict';

require('../../TestHelper');

/* global bootstrapModeler, inject */

var coreModule = require('../../../lib/core');

var ModelCloneHelper = require('../../../lib/util/model/ModelCloneHelper');

var camundaPackage = require('../../fixtures/json/model/camunda');

var camundaModdleModule = require('./camunda-moddle');

function getProp(element, property) {
  return element && element.$model.properties.get(element, property);
}

describe('util/ModelCloneHelper', function() {

  var testModules = [ camundaModdleModule, coreModule ];

  var basicXML = require('../../fixtures/bpmn/basic.bpmn');

  beforeEach(bootstrapModeler(basicXML, {
    modules: testModules,
    moddleExtensions: {
      camunda: camundaPackage
    }
  }));

  var helper;

  beforeEach(inject(function(eventBus) {
    helper = new ModelCloneHelper(eventBus);
  }));

  describe('simple', function() {

    it('should pass property', inject(function(moddle) {

      // given
      var userTask = moddle.create('bpmn:UserTask', {
        asyncBefore: true
      });

      var serviceTask = helper.clone(userTask, moddle.create('bpmn:ServiceTask'), [ 'camunda:asyncBefore' ]);

      expect(getProp(serviceTask, 'camunda:asyncBefore')).to.be.true;
    }));


    it('should not pass property', inject(function(moddle) {

      // given
      var userTask = moddle.create('bpmn:UserTask', {
        assignee: 'foobar'
      });

      var serviceTask = helper.clone(userTask, moddle.create('bpmn:ServiceTask'), []);

      expect(getProp(serviceTask, 'camunda:assignee')).to.not.exist;
    }));

  });

  describe('nested', function() {

    it('should pass nested property - documentation', inject(function(moddle) {

      // given
      var userTask = moddle.create('bpmn:UserTask');

      var docs = userTask.get('documentation');

      docs.push(moddle.create('bpmn:Documentation', { textFormat: 'xyz', text: 'FOO\nBAR' }));
      docs.push(moddle.create('bpmn:Documentation', { text: '<some /><html></html>' }));

      var serviceTask = helper.clone(userTask, moddle.create('bpmn:ServiceTask'), [ 'bpmn:documentation' ]);

      var serviceTaskDocs = getProp(serviceTask, 'bpmn:documentation'),
          userTaskDocs = getProp(userTask, 'bpmn:documentation');

      expect(userTaskDocs[0]).to.not.equal(serviceTaskDocs[0]);

      expect(serviceTaskDocs[0].$parent).to.equal(serviceTask);

      expect(serviceTaskDocs[0].text).to.equal('FOO\nBAR');
      expect(serviceTaskDocs[0].textFormat).to.equal('xyz');

      expect(serviceTaskDocs[1].text).to.equal('<some /><html></html>');
    }));


    it('should pass deeply nested property - executionListener', inject(function(moddle) {

      // given
      var script = moddle.create('camunda:Script', {
        scriptFormat: 'groovy',
        value: 'foo = bar;'
      });

      var execListener = moddle.create('camunda:ExecutionListener', {
        event: 'start',
        script: script
      });

      var extensionElements = moddle.create('bpmn:ExtensionElements', { values: [ execListener ] });

      var userTask = moddle.create('bpmn:UserTask', {
        extensionElements: extensionElements
      });

      var serviceTask = helper.clone(userTask, moddle.create('bpmn:ServiceTask'), [
        'bpmn:extensionElements',
        'camunda:executionListener'
      ]);

      var executionListener = serviceTask.extensionElements.values[0];

      // then
      expect(executionListener).to.not.equal(userTask.extensionElements.values[0]);
      expect(executionListener.$type).to.equal('camunda:ExecutionListener');

      expect(executionListener.$type).to.equal('camunda:ExecutionListener');
      expect(executionListener.$parent).to.equal(serviceTask.extensionElements);

      expect(executionListener.event).to.equal('start');

      expect(executionListener.script.$type).to.equal('camunda:Script');
      expect(executionListener.script.$parent).to.equal(executionListener);

      expect(executionListener.script.scriptFormat).to.equal('groovy');
      expect(executionListener.script.value).to.equal('foo = bar;');
    }));


    it('should pass deeply nested property - inputOutput', inject(function(moddle) {

      // given
      var outputParameter = moddle.create('camunda:OutputParameter', {
        name: 'var1',
        definition: moddle.create('camunda:List', {
          items: [
            moddle.create('camunda:Value', { value: '${1+1}' }),
            moddle.create('camunda:Value', { value: '${1+2}' }),
            moddle.create('camunda:Value', { value: '${1+3}' })
          ]
        })
      });

      var inputOutput = moddle.create('camunda:InputOutput', {
        outputParameters: [ outputParameter ]
      });

      var extensionElements = moddle.create('bpmn:ExtensionElements', { values: [ inputOutput ] });

      var userTask = moddle.create('bpmn:UserTask', {
        extensionElements: extensionElements
      });

      var serviceTask = helper.clone(userTask, moddle.create('bpmn:ServiceTask'), [
        'bpmn:extensionElements',
        'camunda:inputOutput'
      ]);

      var executionListener = serviceTask.extensionElements.values[0];

      // then
      expect(executionListener.$type).to.equal('camunda:InputOutput');

      var newOutParam = executionListener.outputParameters[0];
      var oldOutParam = userTask.extensionElements.values[0].outputParameters[0];

      expect(newOutParam).to.not.equal(oldOutParam);

      expect(newOutParam.$parent).to.equal(executionListener);
      expect(newOutParam.definition).to.not.equal(oldOutParam.definition);
      expect(newOutParam.definition.$parent).to.equal(newOutParam);

      expect(newOutParam.definition.items[0]).to.not.equal(oldOutParam.definition.items[0]);

      expect(newOutParam.definition.items[0].$parent).to.not.equal(newOutParam.definition.$parent);

      expect(newOutParam.$type).to.equal('camunda:OutputParameter');
      expect(newOutParam.definition.$type).to.equal('camunda:List');
      expect(newOutParam.definition.items[0].value).to.equal('${1+1}');
    }));


    it('should not pass disallowed deeply nested property - connector', inject(function(moddle) {

      // given
      var connector = moddle.create('camunda:Connector', {
        connectorId: 'hello_connector'
      });

      var extensionElements = moddle.create('bpmn:ExtensionElements', { values: [ connector ] });

      var serviceTask = moddle.create('bpmn:UserTask', {
        extensionElements: extensionElements
      });

      var userTask = helper.clone(serviceTask, moddle.create('bpmn:UserTask'), [
        'bpmn:extensionElements'
      ]);

      var extElem = userTask.extensionElements;

      // then
      expect(extElem.values).to.be.empty;
    }));

  });


  describe('special cases', function() {

    it('failed job retry time cycle', inject(function(moddle) {

      function createExtElems() {
        var retryTimeCycle = moddle.create('camunda:FailedJobRetryTimeCycle', { body: 'foobar' });

        return moddle.create('bpmn:ExtensionElements', { values: [ retryTimeCycle ] });
      }

      // given
      var timerEvtDef = moddle.create('bpmn:TimerEventDefinition', {
        timeDuration: 'foobar'
      });

      var signalEvtDef = moddle.create('bpmn:SignalEventDefinition', {
        timeDuration: 'foobar'
      });

      var multiInst = moddle.create('bpmn:MultiInstanceLoopCharacteristics');

      var timerStartEvent = moddle.create('bpmn:StartEvent', {
        extensionElements: createExtElems(),
        eventDefinitions: [ timerEvtDef ]
      });

      var signalStartEvt = moddle.create('bpmn:StartEvent', {
        extensionElements: createExtElems(),
        eventDefinitions: [ signalEvtDef ]
      });

      var subProcess = moddle.create('bpmn:SubProcess', {
        extensionElements: createExtElems(),
        loopCharacteristics: multiInst
      });

      var intCatchEvt = helper.clone(timerStartEvent, moddle.create('bpmn:IntermediateCatchEvent'), [
        'bpmn:extensionElements',
        'bpmn:eventDefinitions'
      ]);

      var startEvt = helper.clone(signalStartEvt, moddle.create('bpmn:StartEvent'), [
        'bpmn:extensionElements',
        'bpmn:eventDefinitions'
      ]);

      var newSubProcess = helper.clone(subProcess, moddle.create('bpmn:SubProcess'), [
        'bpmn:extensionElements',
        'bpmn:loopCharacteristics'
      ]);

      var intCatchEvtExtElems = intCatchEvt.extensionElements.values,
          startEvtExtElems = startEvt.extensionElements.values,
          newSubProcessExtElems = newSubProcess.extensionElements.values;

      // then
      function expectTimeCycle(extElems) {
        expect(extElems[0].$type).to.equal('camunda:FailedJobRetryTimeCycle');
        expect(extElems[0].body).to.equal('foobar');
      }

      expectTimeCycle(intCatchEvtExtElems);

      expectTimeCycle(startEvtExtElems);

      expectTimeCycle(newSubProcessExtElems);
    }));


    it('connector', inject(function(moddle) {

      // given
      var connector = moddle.create('camunda:Connector', {
        connectorId: 'hello_connector'
      });

      var extensionElements = moddle.create('bpmn:ExtensionElements', { values: [ connector ] });

      var msgEvtDef = moddle.create('bpmn:MessageEventDefinition');

      var msgIntermThrowEvt = moddle.create('bpmn:IntermediateThrowEvent', {
        extensionElements: extensionElements,
        eventDefinitions: [ msgEvtDef ]
      });

      var clonedElement = helper.clone(msgIntermThrowEvt, moddle.create('bpmn:EndEvent'), [
        'bpmn:extensionElements',
        'bpmn:eventDefinitions'
      ]);

      var extElems = clonedElement.extensionElements.values;

      // then
      expect(extElems[0].$type).to.equal('camunda:Connector');
      expect(extElems[0].connectorId).to.equal('hello_connector');
    }));


    it('field', inject(function(moddle) {

      // given
      var field = moddle.create('camunda:Field', {
        name: 'hello_field'
      });

      var extensionElements = moddle.create('bpmn:ExtensionElements', { values: [ field ] });

      var msgEvtDef = moddle.create('bpmn:MessageEventDefinition');

      var msgIntermThrowEvt = moddle.create('bpmn:IntermediateThrowEvent', {
        extensionElements: extensionElements,
        eventDefinitions: [ msgEvtDef ]
      });

      var clonedElement = helper.clone(msgIntermThrowEvt, moddle.create('bpmn:EndEvent'), [
        'bpmn:extensionElements',
        'bpmn:eventDefinitions'
      ]);

      var extElems = clonedElement.extensionElements.values;

      // then
      expect(extElems[0].$type).to.equal('camunda:Field');
      expect(extElems[0].name).to.equal('hello_field');
    }));


    it('not clone field', inject(function(moddle) {

      // given
      var field = moddle.create('camunda:Field', {
        name: 'hello_field'
      });

      var extensionElements = moddle.create('bpmn:ExtensionElements', { values: [ field ] });

      var msgEvtDef = moddle.create('bpmn:MessageEventDefinition');

      var msgIntermThrowEvt = moddle.create('bpmn:IntermediateThrowEvent', {
        extensionElements: extensionElements,
        eventDefinitions: [ msgEvtDef ]
      });

      var clonedElement = helper.clone(msgIntermThrowEvt, moddle.create('bpmn:IntermediateThrowEvent'), [
        'bpmn:extensionElements'
      ]);

      var extElems = clonedElement.extensionElements;

      // then
      expect(extElems.values).be.empty;
    }));

  });

});
