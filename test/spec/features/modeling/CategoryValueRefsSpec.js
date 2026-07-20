import { expect } from 'chai';

import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import bpmnCopyPasteModule from 'lib/features/copy-paste';
import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';

import copyPasteModule from 'diagram-js/lib/features/copy-paste';

import {
  getBusinessObject
} from 'lib/util/ModelUtil';

import {
  find
} from 'min-dash';


describe('features/modeling - categoryValueRefs', function() {

  var diagramXML = require('./CategoryValueRefs.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      bpmnCopyPasteModule,
      copyPasteModule,
      coreModule,
      modelingModule
    ]
  }));


  it('should import category value references', inject(function(elementRegistry) {

    // given
    var taskA = getBusinessObject(elementRegistry.get('Task_A')),
        taskB = getBusinessObject(elementRegistry.get('Task_B')),
        sequenceFlow = getBusinessObject(elementRegistry.get('SequenceFlow_1')),
        categoryValue = getBusinessObject(elementRegistry.get('Group_1')).categoryValueRef;

    // then
    expect(taskA.categoryValueRef).to.eql([ categoryValue ]);
    expect(taskB.get('categoryValueRef')).to.be.empty;
    expect(sequenceFlow.categoryValueRef).to.eql([ categoryValue ]);
  }));


  describe('should update flow element references', function() {

    it('during move', inject(function(elementRegistry, modeling) {

      // given
      var taskB = elementRegistry.get('Task_B'),
          categoryValue = getBusinessObject(elementRegistry.get('Group_1')).categoryValueRef;

      // when
      modeling.moveShape(taskB, { x: 10, y: 0 });

      // then
      expect(taskB.businessObject.categoryValueRef).to.eql([ categoryValue ]);
    }));


    it('without duplicate references', inject(function(elementRegistry, modeling) {

      // given
      var taskB = elementRegistry.get('Task_B'),
          categoryValue = getBusinessObject(elementRegistry.get('Group_1')).categoryValueRef;

      // when
      modeling.moveShape(taskB, { x: 10, y: 0 });
      modeling.moveShape(taskB, { x: -10, y: 0 });

      // then
      expect(taskB.businessObject.categoryValueRef).to.eql([ categoryValue ]);
    }));


    it('during creation', inject(function(canvas, elementRegistry, modeling) {

      // given
      var group = elementRegistry.get('Group_1'),
          root = canvas.getRootElement(),
          categoryValue = group.businessObject.categoryValueRef;

      // when
      var task = modeling.createShape(
        { type: 'bpmn:Task' },
        { x: 275, y: 200 },
        root
      );

      // then
      expect(task.businessObject.categoryValueRef).to.eql([ categoryValue ]);
    }));


    it('during waypoint updates', inject(function(elementRegistry, modeling) {

      // given
      var sequenceFlow = elementRegistry.get('SequenceFlow_1');

      // when
      modeling.updateWaypoints(sequenceFlow, [
        { x: 500, y: 190 },
        { x: 550, y: 190 }
      ]);

      // then
      expect(sequenceFlow.businessObject.get('categoryValueRef')).to.be.empty;
    }));


    it('in serialized BPMN', inject(function(elementRegistry, modeling) {

      // given
      var taskB = elementRegistry.get('Task_B');

      // when
      modeling.moveShape(taskB, { x: 10, y: 0 });

      // then
      return getBpmnJS().saveXML({ format: true }).then(function(result) {
        expect(result.xml).to.match(
          /<task(?=[^>]*id="Task_B")[^>]*>[\s\S]*?<categoryValueRef>CategoryValue_1/
        );
      });
    }));


    it('during group move with undo and redo', inject(
      function(commandStack, elementRegistry, modeling) {

        // given
        var group = elementRegistry.get('Group_1'),
            taskA = getBusinessObject(elementRegistry.get('Task_A')),
            sequenceFlow = getBusinessObject(elementRegistry.get('SequenceFlow_1')),
            categoryValue = group.businessObject.categoryValueRef;

        // when
        modeling.moveShape(group, { x: 500, y: 0 });

        // then
        expect(taskA.get('categoryValueRef')).to.be.empty;
        expect(sequenceFlow.get('categoryValueRef')).to.be.empty;

        // when
        commandStack.undo();

        // then
        expect(taskA.categoryValueRef).to.eql([ categoryValue ]);
        expect(sequenceFlow.categoryValueRef).to.eql([ categoryValue ]);

        // when
        commandStack.redo();

        // then
        expect(taskA.get('categoryValueRef')).to.be.empty;
        expect(sequenceFlow.get('categoryValueRef')).to.be.empty;
      }
    ));
  });

  describe('should remap group category values', function() {

    it('during copy and paste', inject(function(canvas, copyPaste, elementRegistry) {

      // given
      var group = elementRegistry.get('Group_1'),
          taskA = elementRegistry.get('Task_A'),
          taskB = elementRegistry.get('Task_B'),
          sequenceFlow = elementRegistry.get('SequenceFlow_1'),
          sourceCategoryValue = group.businessObject.categoryValueRef;

      copyPaste.copy([ group, taskA, taskB ]);

      // when
      var pastedElements = copyPaste.paste({
        element: canvas.getRootElement(),
        point: {
          x: 600,
          y: 100
        }
      });

      var pastedGroup = find(pastedElements, function(element) {
        return element.type === 'bpmn:Group';
      });

      var pastedFlowElements = pastedElements.filter(function(element) {
        return element.type === 'bpmn:Task' || element.type === 'bpmn:SequenceFlow';
      });

      var categoryValue = pastedGroup.businessObject.categoryValueRef;

      // then
      expect(categoryValue).not.to.equal(sourceCategoryValue);
      pastedFlowElements.forEach(function(flowElement) {
        expect(flowElement.businessObject.categoryValueRef).to.eql([ categoryValue ]);
      });

      expect(sequenceFlow.businessObject.categoryValueRef).to.eql([ sourceCategoryValue ]);
    }));
  });


  describe('should update group references', function() {

    it('after creating a category value through label editing', inject(
      function(elementRegistry, modeling) {

        // given
        var group = elementRegistry.get('Group_NO_CATEGORY_VALUE'),
            taskB = getBusinessObject(elementRegistry.get('Task_B'));

        // when
        modeling.updateLabel(group, 'Group 2');

        var categoryValue = group.businessObject.categoryValueRef;

        // then
        expect(categoryValue).to.exist;
        expect(taskB.categoryValueRef).to.include(categoryValue);
      }
    ));


    it('should preserve category value referenced by non-rendered flow element', inject(
      function(bpmnjs, elementRegistry, modeling) {

        // given
        var group = elementRegistry.get('Group_PRESERVED'),
            categoryValue = group.businessObject.categoryValueRef,
            category = categoryValue.$parent,
            definitions = bpmnjs.getDefinitions();

        // when
        modeling.removeShape(group);

        // then
        expect(category.categoryValue).to.include(categoryValue);
        expect(definitions.rootElements).to.include(category);
      }
    ));


    it('during deletion with undo and redo', inject(
      function(bpmnjs, commandStack, elementRegistry, modeling) {

        // given
        var group = elementRegistry.get('Group_1'),
            taskA = getBusinessObject(elementRegistry.get('Task_A')),
            sequenceFlow = getBusinessObject(elementRegistry.get('SequenceFlow_1')),
            categoryValue = group.businessObject.categoryValueRef,
            category = categoryValue.$parent,
            definitions = bpmnjs.getDefinitions();

        // when
        modeling.removeShape(group);

        // then
        expect(taskA.get('categoryValueRef')).to.be.empty;
        expect(sequenceFlow.get('categoryValueRef')).to.be.empty;
        expect(category.categoryValue).to.be.empty;
        expect(definitions.rootElements).not.to.include(category);

        // when
        commandStack.undo();

        // then
        expect(taskA.categoryValueRef).to.eql([ categoryValue ]);
        expect(sequenceFlow.categoryValueRef).to.eql([ categoryValue ]);
        expect(definitions.rootElements).to.include(category);

        // when
        commandStack.redo();

        // then
        expect(taskA.get('categoryValueRef')).to.be.empty;
        expect(sequenceFlow.get('categoryValueRef')).to.be.empty;
        expect(definitions.rootElements).not.to.include(category);
      }
    ));
  });
});


describe('features/modeling - categoryValueRefs in collaboration', function() {

  var diagramXML = require('./CategoryValueRefs.collaboration.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule
    ]
  }));


  it('should update participant flow elements when a group is moved', inject(
    function(elementRegistry, modeling) {

      // given
      var group = elementRegistry.get('Group_1'),
          task = getBusinessObject(elementRegistry.get('Task_1'));

      // when
      modeling.moveShape(group, { x: 500, y: 0 });

      // then
      expect(task.get('categoryValueRef')).to.be.empty;
    }
  ));
});
