import { expect } from 'chai';
import sinon from 'sinon';
import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

var testModules = [ coreModule, modelingModule ];


describe('features/modeling - update moddle properties', function() {

  describe('updating bpmn:Error', function() {

    var diagramXML = require('./UpdateModdleProperties.error.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should update', inject(function(elementRegistry, modeling, eventBus) {

      // given
      var eventShape = elementRegistry.get('StartEvent_1');

      var error = eventShape.businessObject.eventDefinitions[0].errorRef;

      var changedElements;

      var elementsChangedListener = sinon.spy(function(event) {
        changedElements = event.elements;
      });

      eventBus.on('elements.changed', elementsChangedListener);

      // assume
      expect(error.name).to.eql('Special Error');

      // when
      modeling.updateModdleProperties(eventShape, error, { name: 'Other Error' });

      // then
      // updated data object
      expect(error.name).to.eql('Other Error');

      // changed affected elements
      expect(changedElements).to.eql([
        eventShape
      ]);

    }));


    describe('semantic parent', function() {

      it('should set on contained element', inject(function(elementRegistry, modeling, moddle) {

        // given
        var eventShape = elementRegistry.get('StartEvent_1'),
            eventDefinition = eventShape.businessObject.eventDefinitions[0],
            extensionElements = moddle.create('bpmn:ExtensionElements');

        // when
        modeling.updateModdleProperties(eventShape, eventDefinition, { extensionElements: extensionElements });

        // then
        expect(extensionElements.$parent).to.equal(eventDefinition);
      }));


      it('should set on contained collection elements', inject(function(elementRegistry, modeling, moddle) {

        // given
        var eventShape = elementRegistry.get('StartEvent_1'),
            eventDefinition = eventShape.businessObject.eventDefinitions[0],
            documentation = moddle.create('bpmn:Documentation');

        // when
        modeling.updateModdleProperties(eventShape, eventDefinition, { documentation: [ documentation ] });

        // then
        expect(documentation.$parent).to.equal(eventDefinition);
      }));


      it('should NOT change on referenced element', inject(function(elementRegistry, modeling, moddle) {

        // given
        var eventShape = elementRegistry.get('StartEvent_1'),
            eventDefinition = eventShape.businessObject.eventDefinitions[0],
            error = moddle.create('bpmn:Error');

        // when
        modeling.updateModdleProperties(eventShape, eventDefinition, { errorRef: error });

        // then
        expect(error.$parent).not.to.exist;
      }));


      it('should unset on undo', inject(function(elementRegistry, modeling, moddle, commandStack) {

        // given
        var eventShape = elementRegistry.get('StartEvent_1'),
            eventDefinition = eventShape.businessObject.eventDefinitions[0],
            extensionElements = moddle.create('bpmn:ExtensionElements');

        modeling.updateModdleProperties(eventShape, eventDefinition, { extensionElements: extensionElements });

        // when
        commandStack.undo();

        // then
        expect(extensionElements.$parent).not.to.exist;
      }));


      it('should set on redo', inject(function(elementRegistry, modeling, moddle, commandStack) {

        // given
        var eventShape = elementRegistry.get('StartEvent_1'),
            eventDefinition = eventShape.businessObject.eventDefinitions[0],
            extensionElements = moddle.create('bpmn:ExtensionElements');

        modeling.updateModdleProperties(eventShape, eventDefinition, { extensionElements: extensionElements });

        commandStack.undo();

        // when
        commandStack.redo();

        // then
        expect(extensionElements.$parent).to.equal(eventDefinition);
      }));

    });

  });


  describe('updating bpmn:DataObject', function() {

    var diagramXML = require('./UpdateModdleProperties.dataObject.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should update', inject(function(elementRegistry, modeling, eventBus) {

      // given
      var dataObjectReference1 = elementRegistry.get('DataObjectReference_1');
      var dataObjectReference2 = elementRegistry.get('DataObjectReference_2');
      var dataObject = dataObjectReference1.businessObject.dataObjectRef;
      var changedElements;

      var elementsChangedListener = sinon.spy(function(event) {
        changedElements = event.elements;
      });

      eventBus.on('elements.changed', elementsChangedListener);

      // assume
      expect(dataObject).to.eql(dataObjectReference2.businessObject.dataObjectRef);

      // when
      modeling.updateModdleProperties(dataObjectReference1, dataObject, { isCollection: true });

      // then
      // updated data object
      expect(dataObject.isCollection).to.be.true;

      // changed affected elements
      expect(changedElements).to.eql([
        dataObjectReference1,
        dataObjectReference2
      ]);
    }));


    it('should undo', inject(function(commandStack, elementRegistry, eventBus, modeling) {

      // given
      var dataObjectReference1 = elementRegistry.get('DataObjectReference_1');
      var dataObjectReference2 = elementRegistry.get('DataObjectReference_2');
      var dataObject = dataObjectReference1.businessObject.dataObjectRef;
      var changedElements;

      var elementsChangedListener = sinon.spy(function(event) {
        changedElements = event.elements;
      });

      modeling.updateModdleProperties(dataObjectReference1, dataObject, { isCollection: true });

      eventBus.on('elements.changed', elementsChangedListener);

      // when
      commandStack.undo();

      // then
      // updated data object
      expect(dataObject.isCollection).to.be.false;

      // changed affected elements
      expect(changedElements).to.eql([
        dataObjectReference1,
        dataObjectReference2
      ]);
    }));


    it('should redo', inject(function(commandStack, elementRegistry, eventBus, modeling) {

      // given
      var dataObjectReference1 = elementRegistry.get('DataObjectReference_1');
      var dataObjectReference2 = elementRegistry.get('DataObjectReference_2');
      var dataObject = dataObjectReference1.businessObject.dataObjectRef;
      var changedElements;

      var elementsChangedListener = sinon.spy(function(event) {
        changedElements = event.elements;
      });

      modeling.updateModdleProperties(dataObjectReference1, dataObject, { isCollection: true });

      commandStack.undo();

      eventBus.on('elements.changed', elementsChangedListener);

      // when
      commandStack.redo();

      // then
      // updated data object
      expect(dataObject.isCollection).to.be.true;

      // changed affected elements
      expect(changedElements).to.eql([
        dataObjectReference1,
        dataObjectReference2
      ]);

    }));

  });

});