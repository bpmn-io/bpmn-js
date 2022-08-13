import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  getBusinessObject,
  is
} from 'lib/util/ModelUtil';

import bpmnCopyPasteModule from 'lib/features/copy-paste';
import copyPasteModule from 'diagram-js/lib/features/copy-paste';
import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

import { find } from 'min-dash';


describe('features/modeling/behavior - groups', function() {

  var testModules = [
    coreModule,
    copyPasteModule,
    bpmnCopyPasteModule,
    modelingModule
  ];

  var processDiagramXML = require('./GroupBehaviorSpec.bpmn');

  beforeEach(bootstrapModeler(processDiagramXML, {
    modules: testModules.concat(modelingModule)
  }));


  describe('creation', function() {

    it('should NOT create new CategoryValue if one exists', inject(
      function(canvas, elementFactory, elementRegistry, modeling) {

        // given
        var group1 = elementRegistry.get('Group_1'),
            categoryValue = getBusinessObject(group1).categoryValueRef,
            root = canvas.getRootElement(),
            definitions = getBusinessObject(root).$parent,
            originalSize = definitions.get('rootElements').length;

        var group = elementFactory.createShape({ type: 'bpmn:Group' });

        getBusinessObject(group).categoryValueRef = categoryValue;

        // when
        var groupShape = modeling.createShape(group, { x: 100, y: 100 }, root),
            categoryValueRef = getBusinessObject(groupShape).categoryValueRef;

        // then
        expect(categoryValueRef).to.eql(categoryValue);

        expect(definitions.get('rootElements')).to.have.length(originalSize);
      }
    ));


    describe('should NOT create Category for new Group', function() {

      it('execute', inject(function(canvas, elementFactory, modeling) {

        // given
        var root = canvas.getRootElement();

        // when
        var group = modeling.createShape({ type: 'bpmn:Group' }, { x: 100, y: 100 }, root),
            groupBo = getBusinessObject(group),
            categoryValue = groupBo.categoryValueRef;

        // then
        expect(categoryValue).not.to.exist;
      }));


      it('undo', inject(function(canvas, elementFactory, modeling, commandStack) {

        // given
        var root = canvas.getRootElement();

        // when
        var group = modeling.createShape({ type: 'bpmn:Group' }, { x: 100, y: 100 }, root),
            groupBo = getBusinessObject(group);

        commandStack.undo();

        var categoryValue = groupBo.categoryValueRef;

        // then
        expect(categoryValue).not.to.exist;
      }));


      it('redo', inject(function(canvas, elementFactory, modeling, commandStack) {

        // given
        var root = canvas.getRootElement();

        // when
        var group = modeling.createShape({ type: 'bpmn:Group' }, { x: 100, y: 100 }, root),
            groupBo = getBusinessObject(group);

        commandStack.undo();
        commandStack.redo();

        // then
        expect(groupBo.categoryValueRef).not.to.exist;
      }));

    });


    describe('should paste with Category', function() {

      var groupBo, rootElements;

      beforeEach(inject(function(canvas, copyPaste, elementRegistry) {

        // given
        var group = elementRegistry.get('Group_1'),
            rootElement = canvas.getRootElement();

        copyPaste.copy(group);

        // when
        var elements = copyPaste.paste({
          element: rootElement,
          point: {
            x: 500,
            y: 500
          }
        });

        group = find(elements, function(element) {
          return is(element, 'bpmn:Group');
        });

        groupBo = getBusinessObject(group);

        rootElements = getBusinessObject(canvas.getRootElement()).$parent.rootElements;
      }));


      it('<do>', function() {

        // then
        expect(groupBo.categoryValueRef).to.exist;
        expect(groupBo.categoryValueRef.$parent).to.exist;
        expect(groupBo.categoryValueRef.value).to.equal('Value 1');

        expect(rootElements).to.have.length(4);
      });


      it('<undo>', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        expect(rootElements).to.have.length(3);
      }));


      it('<redo>', inject(function(commandStack) {

        // given
        var categoryValue = groupBo.categoryValueRef,
            category = categoryValue.$parent;

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(groupBo.categoryValueRef).to.equal(categoryValue);
        expect(groupBo.categoryValueRef.$parent).to.equal(category);

        expect(rootElements).to.have.length(4);
      }));

    });


    it('should create new Category in definitions', inject(
      function(canvas, elementFactory, modeling, bpmnjs) {

        // given
        var root = canvas.findRoot('Subprocess_1_plane'),
            definitions = bpmnjs.getDefinitions();

        // operate on sub-process plane
        canvas.setRootElement(root);

        // when
        var group = modeling.createShape({ type: 'bpmn:Group' }, { x: 100, y: 100 }, root),
            groupBo = getBusinessObject(group);

        // create label
        modeling.updateLabel(group, 'FOO BAR');

        var categoryValue = groupBo.categoryValueRef,
            category = categoryValue.$parent;

        // then
        expect(categoryValue).to.exist;
        expect(category).to.exist;

        expect(category.get('categoryValue')).to.include(categoryValue);
        expect(definitions.get('rootElements')).to.include(category);
      }
    ));

  });


  describe('deletion', function() {

    it('should NOT remove CategoryValue if still referenced', inject(
      function(elementRegistry, modeling) {

        // given
        var groupShape = elementRegistry.get('Group_1'),
            groupBo = getBusinessObject(groupShape);

        var categoryValue = groupBo.categoryValueRef,
            category = categoryValue.$parent;

        // when
        modeling.removeShape(groupShape);

        // then
        expect(groupBo.categoryValueRef).not.to.exist;

        expect(category.get('categoryValue')).to.contain(categoryValue);
      }
    ));


    it('should NOT remove Category if still referenced', inject(
      function(canvas, elementRegistry, modeling) {

        // given
        var groupShape = elementRegistry.get('Group_3'),
            groupBo = getBusinessObject(groupShape),
            root = canvas.getRootElement(),
            definitions = getBusinessObject(root).$parent;

        var categoryValue = groupBo.categoryValueRef,
            category = categoryValue.$parent;

        // when
        modeling.removeShape(groupShape);

        // then
        expect(groupBo.categoryValueRef).not.to.exist;

        expect(definitions.get('rootElements')).to.contain(category);
      }
    ));


    describe('should remove Category + CategoryValue on deletion', function() {

      it('execute', inject(function(canvas, elementRegistry, modeling) {

        // given
        var groupShape = elementRegistry.get('Group_4'),
            groupBo = getBusinessObject(groupShape),
            root = canvas.getRootElement(),
            definitions = getBusinessObject(root).$parent;

        var categoryValue = groupBo.categoryValueRef,
            category = categoryValue.$parent;

        // when
        modeling.removeShape(groupShape);

        // then
        expect(category.get('categoryValue')).not.to.contain(categoryValue);

        expect(definitions.get('rootElements')).not.to.contain(category);
      }));


      it('undo', inject(function(canvas, elementRegistry, modeling, commandStack) {

        // given
        var groupShape = elementRegistry.get('Group_4'),
            groupBo = getBusinessObject(groupShape),
            root = canvas.getRootElement(),
            definitions = getBusinessObject(root).$parent;

        var categoryValue = groupBo.categoryValueRef,
            category = categoryValue.$parent;

        // when
        modeling.removeShape(groupShape);

        commandStack.undo();

        // then
        expect(category.get('categoryValue')).to.include(categoryValue);
        expect(definitions.get('rootElements')).to.include(category);
      }));


      it('redo', inject(function(canvas, elementRegistry, modeling, commandStack) {

        // given
        var groupShape = elementRegistry.get('Group_4'),
            groupBo = getBusinessObject(groupShape),
            root = canvas.getRootElement(),
            definitions = getBusinessObject(root).$parent;

        var categoryValue = groupBo.categoryValueRef,
            category = categoryValue.$parent;

        // when
        modeling.removeShape(groupShape);

        commandStack.undo();
        commandStack.redo();

        // then
        expect(category.get('categoryValue')).not.to.include(categoryValue);
        expect(definitions.get('rootElements')).not.to.include(category);
      }));

    });


    describe('should handle non-existing CategoryValue gracefully', function() {

      it('execute', inject(function(elementRegistry, modeling) {

        // given
        var groupShape = elementRegistry.get('Group_NO_CATEGORY_VALUE'),
            groupBo = getBusinessObject(groupShape);

        // assume
        expect(groupBo.categoryValueRef).not.to.exist;

        // then
        modeling.removeShape(groupShape);
      }));


      it('undo', inject(function(elementRegistry, modeling, commandStack) {

        // given
        var groupShape = elementRegistry.get('Group_NO_CATEGORY_VALUE'),
            groupBo = getBusinessObject(groupShape);

        // when
        modeling.removeShape(groupShape);

        commandStack.undo();

        // then
        expect(groupBo.categoryValueRef).not.to.exist;
      }));


      it('redo', inject(function(elementRegistry, modeling, commandStack) {

        // given
        var groupShape = elementRegistry.get('Group_NO_CATEGORY_VALUE'),
            groupBo = getBusinessObject(groupShape);

        // when
        modeling.removeShape(groupShape);

        commandStack.undo();
        commandStack.redo();

        // then
        expect(groupBo.categoryValueRef).not.to.exist;
      }));

    });

  });


  describe('label editing', function() {

    describe('should create Category before setting label', function() {

      it('execute', inject(function(elementRegistry, modeling) {

        // given
        var group = elementRegistry.get('Group_NO_CATEGORY_VALUE'),
            groupBo = getBusinessObject(group);

        // assume
        expect(groupBo.categoryValueRef).not.to.exist;

        // when
        modeling.updateLabel(group, 'Foo bar');

        // then
        expect(groupBo.categoryValueRef).to.exist;
        expect(groupBo.categoryValueRef.value).to.eql('Foo bar');

        expect(groupBo.categoryValueRef.$parent).to.exist;
      }));


      it('undo', inject(function(elementRegistry, modeling, commandStack) {

        // given
        var group = elementRegistry.get('Group_NO_CATEGORY_VALUE'),
            groupBo = getBusinessObject(group);

        // assume
        expect(groupBo.categoryValueRef).not.to.exist;

        // when
        modeling.updateLabel(group, 'Foo bar');

        commandStack.undo();

        // then
        expect(groupBo.categoryValueRef).not.to.exist;
      }));


      it('redo', inject(function(elementRegistry, modeling, commandStack) {

        // given
        var group = elementRegistry.get('Group_NO_CATEGORY_VALUE'),
            groupBo = getBusinessObject(group);

        // assume
        expect(groupBo.categoryValueRef).not.to.exist;

        // when
        modeling.updateLabel(group, 'Foo bar');

        commandStack.undo();
        commandStack.redo();

        // then
        expect(groupBo.categoryValueRef).to.exist;
        expect(groupBo.categoryValueRef.value).to.eql('Foo bar');

        expect(groupBo.categoryValueRef.$parent).to.exist;
      }));

    });

  });

});
