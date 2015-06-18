'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling - update properties', function() {

  var diagramXML = require('../../../fixtures/bpmn/conditions.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  var updatedElements;

  beforeEach(inject(function(eventBus) {

    eventBus.on([ 'commandStack.execute', 'commandStack.revert' ], function() {
      updatedElements = [];
    });

    eventBus.on('element.changed', function(event) {
      updatedElements.push(event.element);
    });

  }));


  describe('should execute', function() {

    it('setting loop characteristics', inject(function(elementRegistry, modeling, moddle) {

      // given
      var loopCharacteristics = moddle.create('bpmn:MultiInstanceLoopCharacteristics');

      var taskShape = elementRegistry.get('ServiceTask_1');

      // when
      modeling.updateProperties(taskShape, { loopCharacteristics: loopCharacteristics });

      // then
      expect(taskShape.businessObject.loopCharacteristics).toBe(loopCharacteristics);


      // task shape got updated
      expect(updatedElements).toContain(taskShape);
    }));


    it('updating default flow', inject(function(elementRegistry, modeling) {

      // given
      var gatewayShape = elementRegistry.get('ExclusiveGateway_1');

      // when
      modeling.updateProperties(gatewayShape, { 'default': undefined });

      // then
      expect(gatewayShape.businessObject['default']).not.toBeDefined();

      // flow got updated, too
      expect(updatedElements).toContain(elementRegistry.get('SequenceFlow_1'));
    }));


    it('updating name', inject(function(elementRegistry, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_1');

      // when
      modeling.updateProperties(flowConnection, { name: 'FOO BAR' });

      // then
      expect(flowConnection.businessObject.name).toBe('FOO BAR');

      // flow label got updated, too
      expect(updatedElements).toContain(elementRegistry.get('SequenceFlow_1_label'));
    }));


    it('unsetting name', inject(function(elementRegistry, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_3');

      // when
      modeling.updateProperties(flowConnection, { name: undefined });

      // then
      expect(flowConnection.businessObject.name).not.toBeDefined();
    }));


    it('updating id', inject(function(elementRegistry, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_1');

      // when
      modeling.updateProperties(flowConnection, { id: 'FOO_BAR' });

      // then
      expect(flowConnection.businessObject.id).toBe('FOO_BAR');
      expect(flowConnection.id).toBe('FOO_BAR');
    }));


    it('updating extension elements', inject(function(elementRegistry, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_1');

      // when
      modeling.updateProperties(flowConnection, {
        'xmlns:foo': 'http://foo',
        'foo:customAttr': 'FOO'
      });

      // then
      expect(flowConnection.businessObject.get('xmlns:foo')).toBe('http://foo');
      expect(flowConnection.businessObject.get('foo:customAttr')).toBe('FOO');
    }));

  });


  describe('should undo', function() {

    it('setting loop characteristics', inject(function(elementRegistry, modeling, commandStack, moddle) {

      // given
      var loopCharactersistics = moddle.create('bpmn:MultiInstanceLoopCharacteristics');

      var taskShape = elementRegistry.get('ServiceTask_1');

      // when
      modeling.updateProperties(taskShape, { loopCharacteristics: loopCharactersistics });
      commandStack.undo();

      // then
      expect(taskShape.businessObject.loopCharactersistics).not.toBeDefined();
    }));


    it('updating default flow', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var gatewayShape = elementRegistry.get('ExclusiveGateway_1');

      // when
      modeling.updateProperties(gatewayShape, { 'default': undefined });
      commandStack.undo();

      // then
      expect(gatewayShape.businessObject['default']).toBeDefined();

      // flow got updated, too
      expect(updatedElements).toContain(elementRegistry.get('SequenceFlow_1'));
    }));


    it('updating name', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_1');

      // when
      modeling.updateProperties(flowConnection, { name: 'FOO BAR' });
      commandStack.undo();

      // then
      expect(flowConnection.businessObject.name).toBe('default');

      // flow got updated, too
      expect(updatedElements).toContain(elementRegistry.get('SequenceFlow_1_label'));
    }));


    it('unsetting name', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_3');

      modeling.updateProperties(flowConnection, { name: undefined });

      // when
      commandStack.undo();

      // then
      expect(flowConnection.businessObject.name).toBe('conditional');
    }));


    it('updating id', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_1');

      // when
      modeling.updateProperties(flowConnection, { id: 'FOO_BAR' });
      commandStack.undo();

      // then
      expect(flowConnection.businessObject.id).toBe('SequenceFlow_1');
      expect(flowConnection.id).toBe('SequenceFlow_1');
    }));


    it('updating extension elements', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_1');

      modeling.updateProperties(flowConnection, {
        'xmlns:foo': 'http://foo',
        'foo:customAttr': 'FOO'
      });

      // when
      commandStack.undo();

      // then
      expect(flowConnection.businessObject.get('xmlns:foo')).toBe(undefined);
      expect(flowConnection.businessObject.get('foo:customAttr')).toBe(undefined);
    }));

  });


  describe('should redo', function() {

    it('setting loop characteristics', inject(function(elementRegistry, modeling, commandStack, moddle) {

      // given
      var loopCharacteristics = moddle.create('bpmn:MultiInstanceLoopCharacteristics');

      var taskShape = elementRegistry.get('ServiceTask_1');

      // when
      modeling.updateProperties(taskShape, { loopCharacteristics: loopCharacteristics });
      commandStack.undo();
      commandStack.redo();

      // then
      expect(taskShape.businessObject.loopCharacteristics).toBe(loopCharacteristics);
    }));


    it('updating default flow', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var gatewayShape = elementRegistry.get('ExclusiveGateway_1');

      // when
      modeling.updateProperties(gatewayShape, { 'default': undefined });
      commandStack.undo();
      commandStack.redo();

      // then
      expect(gatewayShape.businessObject['default']).not.toBeDefined();

      // flow got updated, too
      expect(updatedElements).toContain(elementRegistry.get('SequenceFlow_1'));
    }));


    it('updating name', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_1');

      // when
      modeling.updateProperties(flowConnection, { name: 'FOO BAR' });
      commandStack.undo();
      commandStack.redo();

      // then
      expect(flowConnection.businessObject.name).toBe('FOO BAR');

      // flow got updated, too
      expect(updatedElements).toContain(elementRegistry.get('SequenceFlow_1_label'));
    }));


    it('unsetting name', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_3');

      modeling.updateProperties(flowConnection, { name: undefined });

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(flowConnection.businessObject.name).not.toBeDefined();
    }));

  });

});
