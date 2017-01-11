'use strict';

require('../../../TestHelper');

/* global bootstrapModeler, inject */

var bpmnCloneModule = require('../../../../lib/features/bpmn-clone'),
    coreModule = require('../../../../lib/core');

var camundaPackage = require('../../../fixtures/json/model/camunda');

function getProp(element, property) {
  return element && element.$model.properties.get(element, property);
}

describe('features/bpmn-clone', function() {

  var testModules = [ bpmnCloneModule, coreModule ];

  var basicXML = require('../../../fixtures/bpmn/basic.bpmn');

  beforeEach(bootstrapModeler(basicXML, {
    modules: testModules,
    moddleExtensions: {
      camunda: camundaPackage
    }
  }));

  describe('simple', function() {

    it('should pass property', inject(function(moddle, bpmnClone) {

      // given
      var userTask = moddle.create('bpmn:UserTask', {
        name: 'Field_1',
        stringValue: 'myFieldValue',
        asyncBefore: true
      });

      var serviceTask = bpmnClone.clone(userTask, moddle.create('bpmn:ServiceTask'), [ 'camunda:asyncBefore' ]);

      expect(getProp(serviceTask, 'camunda:asyncBefore')).to.be.true;
    }));


    it('should not pass property', inject(function(bpmnClone, moddle) {

      // given
      var userTask = moddle.create('bpmn:UserTask', {
        name: 'Field_1',
        stringValue: 'myFieldValue',
        assignee: 'foobar'
      });

      var serviceTask = bpmnClone.clone(userTask, moddle.create('bpmn:ServiceTask'), []);

      expect(getProp(serviceTask, 'camunda:assignee')).to.not.exist;
    }));

  });

  describe('nested', function() {

    it('should pass nested property - documentation', inject(function(moddle, bpmnClone) {

      // given
      var userTask = moddle.create('bpmn:UserTask', {
        name: 'Field_1',
        stringValue: 'myFieldValue'
      });

      var docs = userTask.get('documentation');

      docs.push(moddle.create('bpmn:Documentation', { textFormat: 'xyz', text: 'FOO\nBAR' }));
      docs.push(moddle.create('bpmn:Documentation', { text: '<some /><html></html>' }));

      var serviceTask = bpmnClone.clone(userTask, moddle.create('bpmn:ServiceTask'), [ 'bpmn:documentation' ]);

      var serviceTaskDocs = getProp(serviceTask, 'bpmn:documentation'),
          userTaskDocs = getProp(userTask, 'bpmn:documentation');

      expect(userTaskDocs[0]).to.not.equal(serviceTaskDocs[0]);

      expect(serviceTaskDocs[0].text).to.equal('FOO\nBAR');
      expect(serviceTaskDocs[0].textFormat).to.equal('xyz');

      expect(serviceTaskDocs[1].text).to.equal('<some /><html></html>');
    }));


    it('should pass deeply nested property - executionListener', inject(function(moddle, bpmnClone) {

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
        name: 'Field_1',
        stringValue: 'myFieldValue',
        extensionElements: extensionElements
      });

      var serviceTask = bpmnClone.clone(userTask, moddle.create('bpmn:ServiceTask'), [
        'bpmn:extensionElements',
        'camunda:executionListener'
      ]);

      var executionListener = serviceTask.extensionElements.values[0];

      // then
      expect(executionListener.$type).to.equal('camunda:ExecutionListener');
      expect(executionListener.event).to.equal('start');

      expect(executionListener.script.$type).to.equal('camunda:Script');
      expect(executionListener.script.scriptFormat).to.equal('groovy');
      expect(executionListener.script.value).to.equal('foo = bar;');
    }));


    it('should pass deeply nested property - inputOutput', inject(function(moddle, bpmnClone) {

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
        name: 'Field_1',
        stringValue: 'myFieldValue',
        extensionElements: extensionElements
      });

      var serviceTask = bpmnClone.clone(userTask, moddle.create('bpmn:ServiceTask'), [
        'bpmn:extensionElements',
        'camunda:inputOutput'
      ]);

      var executionListener = serviceTask.extensionElements.values[0];

      // then
      expect(executionListener.$type).to.equal('camunda:InputOutput');

      var newOutParam = executionListener.outputParameters[0];
      var oldOutParam = userTask.extensionElements.values[0].outputParameters[0];

      expect(newOutParam).to.not.equal(oldOutParam);
      expect(newOutParam.definition).to.not.equal(oldOutParam.definition);
      expect(newOutParam.definition.items[0]).to.not.equal(oldOutParam.definition.items[0]);

      expect(newOutParam.$type).to.equal('camunda:OutputParameter');
      expect(newOutParam.definition.$type).to.equal('camunda:List');
      expect(newOutParam.definition.items[0].value).to.equal('${1+1}');
    }));

  });

});
