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