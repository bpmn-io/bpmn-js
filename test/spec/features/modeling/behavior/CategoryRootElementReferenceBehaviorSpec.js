import { expect } from 'chai';

import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';

import {
  getBusinessObject
} from 'lib/util/ModelUtil';


describe('features/modeling - category root element reference behavior', function() {

  var diagramXML = require('./GroupBehaviorSpec.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule
    ]
  }));


  describe('should add unlinked categories', function() {

    var category,
        categoryValue,
        group;

    beforeEach(inject(function(bpmnFactory, canvas, elementFactory, modeling) {

      // given
      category = bpmnFactory.create('bpmn:Category');
      categoryValue = bpmnFactory.create('bpmn:CategoryValue');
      categoryValue.$parent = category;

      group = elementFactory.createShape({ type: 'bpmn:Group' });
      getBusinessObject(group).categoryValueRef = categoryValue;

      // when
      group = modeling.createShape(group, { x: 100, y: 100 }, canvas.getRootElement());
    }));


    it('<do>', function() {

      // then
      expect(category.get('categoryValue')).to.include(categoryValue);
      expectRootElement(category);
    });


    it('<undo>', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      expect(getBusinessObject(group).categoryValueRef).not.to.exist;
      expect(category.get('categoryValue')).not.to.include(categoryValue);
      expectNoRootElement(category);
    }));


    it('<redo>', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(getBusinessObject(group).categoryValueRef).to.equal(categoryValue);
      expect(category.get('categoryValue')).to.include(categoryValue);
      expectRootElement(category);
    }));

  });


  describe('should add label categories', function() {

    var category,
        categoryValue,
        group;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      group = elementRegistry.get('Group_NO_CATEGORY_VALUE');

      // when
      modeling.updateLabel(group, 'Group');

      categoryValue = getBusinessObject(group).categoryValueRef;
      category = categoryValue.$parent;
    }));


    it('<do>', function() {

      // then
      expect(category.get('categoryValue')).to.include(categoryValue);
      expectRootElement(category);
    });


    it('<undo>', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      expect(getBusinessObject(group).categoryValueRef).not.to.exist;
      expect(category.get('categoryValue')).not.to.include(categoryValue);
      expectNoRootElement(category);
    }));


    it('<redo>', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(getBusinessObject(group).categoryValueRef).to.equal(categoryValue);
      expect(category.get('categoryValue')).to.include(categoryValue);
      expectRootElement(category);
    }));

  });


  describe('should remove unreferenced categories', function() {

    var category,
        categoryValue,
        group;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      group = elementRegistry.get('Group_4');
      categoryValue = getBusinessObject(group).categoryValueRef;
      category = categoryValue.$parent;

      // when
      modeling.removeShape(group);
    }));


    it('<do>', function() {

      // then
      expect(category.get('categoryValue')).not.to.include(categoryValue);
      expectNoRootElement(category);
    });


    it('<undo>', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      expect(getBusinessObject(group).categoryValueRef).to.equal(categoryValue);
      expect(category.get('categoryValue')).to.include(categoryValue);
      expectRootElement(category);
    }));


    it('<redo>', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(category.get('categoryValue')).not.to.include(categoryValue);
      expectNoRootElement(category);
    }));

  });

});


// helpers //////////

function expectRootElement(category) {
  expect(hasRootElement(category)).to.be.true;
}

function expectNoRootElement(category) {
  expect(hasRootElement(category)).to.be.false;
}

function hasRootElement(category) {
  return getBpmnJS().getDefinitions().get('rootElements').includes(category);
}
