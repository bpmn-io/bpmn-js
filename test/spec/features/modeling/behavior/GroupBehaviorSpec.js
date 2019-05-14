import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  getBusinessObject
} from 'lib/util/ModelUtil';

import {
  indexOf as collectionIndexOf
} from 'diagram-js/lib/util/Collections';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling/behavior - groups', function() {

  var testModules = [ coreModule, modelingModule ];


  var processDiagramXML = require('./GroupBehaviorSpec.bpmn');

  beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules.concat(modelingModule) }));

  function expectIncludedOrNot(collection, object, expected) {
    var isIncluded = collectionIndexOf(collection, object) >= 0;

    expect(isIncluded).to.equal(expected);
  }

  describe('creation', function() {

    describe('should create new Category for every new Group', function() {

      it('execute', inject(function(canvas, elementFactory, modeling) {

        // given
        var group = elementFactory.createShape({ type: 'bpmn:Group' }),
            root = canvas.getRootElement(),
            definitions = getBusinessObject(root).$parent;

        // when
        var groupShape = modeling.createShape(group, { x: 100, y: 100 }, root),
            categoryValueRef = getBusinessObject(groupShape).categoryValueRef,
            category = categoryValueRef.$parent;

        // then
        expect(categoryValueRef).to.exist;
        expect(category).to.exist;

        expectIncludedOrNot(
          category.get('categoryValue'),
          categoryValueRef,
          true
        );

        expectIncludedOrNot(
          definitions.get('rootElements'),
          category,
          true
        );

      }));


      it('undo', inject(function(canvas, elementFactory, modeling, commandStack) {

        // given
        var group = elementFactory.createShape({ type: 'bpmn:Group' }),
            root = canvas.getRootElement();

        // when
        var groupShape = modeling.createShape(group, { x: 100, y: 100 }, root);

        commandStack.undo();

        var categoryValueRef = getBusinessObject(groupShape).categoryValueRef;

        // then
        expect(categoryValueRef).not.to.exist;

      }));


      it('redo', inject(function(canvas, elementFactory, modeling, commandStack) {

        // given
        var group = elementFactory.createShape({ type: 'bpmn:Group' }),
            root = canvas.getRootElement(),
            definitions = getBusinessObject(root).$parent;

        // when
        var groupShape = modeling.createShape(group, { x: 100, y: 100 }, root);

        commandStack.undo();
        commandStack.redo();

        var categoryValueRef = getBusinessObject(groupShape).categoryValueRef,
            category = categoryValueRef.$parent;

        // then
        expect(categoryValueRef).to.exist;
        expect(categoryValueRef.$parent).to.exist;

        expectIncludedOrNot(
          category.get('categoryValue'),
          categoryValueRef,
          true
        );

        expectIncludedOrNot(
          definitions.get('rootElements'),
          category,
          true
        );

      }));

    });

  });


  describe('deletion', function() {

    it('should NOT remove CategoryValue if it is still referenced somewhere', inject(
      function(elementRegistry, modeling) {

        // given
        var groupShape = elementRegistry.get('Group_1');

        // when
        modeling.removeShape(groupShape);

        var categoryValueRef = getBusinessObject(groupShape).categoryValueRef,
            category = categoryValueRef.$parent;

        // then
        expectIncludedOrNot(
          category.get('categoryValue'),
          categoryValueRef,
          true
        );

      }
    ));


    it('should NOT remove Category if it still has CategoryValues', inject(
      function(canvas, elementRegistry, modeling) {

        // given
        var groupShape = elementRegistry.get('Group_3'),
            root = canvas.getRootElement(),
            definitions = getBusinessObject(root).$parent;

        // when
        modeling.removeShape(groupShape);

        var categoryValueRef = getBusinessObject(groupShape).categoryValueRef;

        // then
        expectIncludedOrNot(
          definitions.get('rootElements'),
          categoryValueRef.$parent,
          true
        );

      }
    ));


    describe('should remove referenced Category + Value when Group was deleted', function() {

      it('execute', inject(function(canvas, elementRegistry, modeling) {

        // given
        var groupShape = elementRegistry.get('Group_4'),
            root = canvas.getRootElement(),
            definitions = getBusinessObject(root).$parent;

        // when
        modeling.removeShape(groupShape);

        var categoryValueRef = getBusinessObject(groupShape).categoryValueRef,
            category = categoryValueRef.$parent;


        // then
        expectIncludedOrNot(
          category.get('categoryValue'),
          categoryValueRef,
          false
        );

        expectIncludedOrNot(
          definitions.get('rootElements'),
          category,
          false
        );

      }));


      it('undo', inject(function(canvas, elementRegistry, modeling, commandStack) {

        // given
        var groupShape = elementRegistry.get('Group_4'),
            root = canvas.getRootElement(),
            definitions = getBusinessObject(root).$parent;

        // when
        modeling.removeShape(groupShape);

        commandStack.undo();

        var categoryValueRef = getBusinessObject(groupShape).categoryValueRef,
            category = categoryValueRef.$parent;

        // then
        expectIncludedOrNot(
          category.get('categoryValue'),
          categoryValueRef,
          true
        );

        expectIncludedOrNot(
          definitions.get('rootElements'),
          category,
          true
        );

      }));


      it('redo', inject(function(canvas, elementRegistry, modeling, commandStack) {

        // given
        var groupShape = elementRegistry.get('Group_4'),
            root = canvas.getRootElement(),
            definitions = getBusinessObject(root).$parent;

        // when
        modeling.removeShape(groupShape);

        commandStack.undo();
        commandStack.redo();

        var categoryValueRef = getBusinessObject(groupShape).categoryValueRef,
            category = categoryValueRef.$parent;


        // then
        expectIncludedOrNot(
          category.get('categoryValue'),
          categoryValueRef,
          false
        );

        expectIncludedOrNot(
          definitions.get('rootElements'),
          category,
          false
        );

      }));

    });

  });

});
