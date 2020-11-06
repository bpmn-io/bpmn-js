import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

describe('features/modeling - update data object', function() {

  var diagramXML = require('./UpdateDataObject.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should do', inject(function(elementRegistry, modeling, eventBus) {

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
    modeling.updateDataObject(dataObject, { isCollection: true });

    // then
    expect(changedElements).to.have.length(2);
    expect(changedElements).to.contain(dataObjectReference1);
    expect(changedElements).to.contain(dataObjectReference2);
    expect(dataObject.isCollection).to.be.true;
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

    modeling.updateDataObject(dataObject, { isCollection: true });

    eventBus.on('elements.changed', elementsChangedListener);

    // when
    commandStack.undo();

    // then
    expect(changedElements).to.have.length(2);
    expect(changedElements).to.contain(dataObjectReference1);
    expect(changedElements).to.contain(dataObjectReference2);
    expect(dataObject.isCollection).to.be.false;
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

    modeling.updateDataObject(dataObject, { isCollection: true });

    commandStack.undo();

    eventBus.on('elements.changed', elementsChangedListener);

    // when
    commandStack.redo();

    // then
    expect(changedElements).to.have.length(2);
    expect(changedElements).to.contain(dataObjectReference1);
    expect(changedElements).to.contain(dataObjectReference2);
    expect(dataObject.isCollection).to.be.true;
  }));
});