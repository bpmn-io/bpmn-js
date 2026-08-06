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


describe('features/modeling - updateCategoryValueRefs', function() {

  var diagramXML = require('./UpdateCategoryValueRefs.bpmn');

  var flowElementsReferencingCategoryValue = [
    'StartEvent_1',
    'Task_1',
    'SequenceFlow_1',
    'SubProcess_1',
    'StartEvent_3',
    'SubProcess_2'
  ];

  var flowElementsNotReferencingCategoryValue = [
    'StartEvent_2',
    'Task_2',
    'SequenceFlow_2',
    'SubProcess_3',
    'StartEvent_5',
    'SubProcess_4'
  ];

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      bpmnCopyPasteModule,
      copyPasteModule,
      coreModule,
      modelingModule
    ]
  }));


  describe('should synchronize flow element references', function() {

    it('when moving a flow element into a group', inject(function(elementRegistry, modeling) {

      // given
      var task = elementRegistry.get('Task_2'),
          categoryValue = getCategoryValue('Group_1');

      // when
      modeling.moveShape(task, { x: 0, y: -250 });

      // then
      expectCategoryValueRefs([ 'Task_2' ], [ categoryValue ]);
    }));


    it('when moving a flow element out of a group', inject(function(elementRegistry, modeling) {

      // given
      var task = elementRegistry.get('Task_1');

      // when
      modeling.moveShape(task, { x: 0, y: 250 });

      // then
      expectCategoryValueRefs([ 'Task_1' ], []);
    }));


    it('when resizing a flow element into a group', inject(function(elementRegistry, modeling) {

      // given
      var task = elementRegistry.get('Task_2'),
          categoryValue = getCategoryValue('Group_1');

      // when
      modeling.resizeShape(task, {
        x: task.x,
        y: 300,
        width: task.width,
        height: task.height
      });

      // then
      expectCategoryValueRefs([ 'Task_2' ], [ categoryValue ]);
    }));


    it('when moving a connection into a group', inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('StartEvent_2'),
          target = elementRegistry.get('Task_2'),
          categoryValue = getCategoryValue('Group_1');

      // when
      modeling.moveShape(source, { x: 0, y: -250 });
      modeling.moveShape(target, { x: 0, y: -250 });

      // then
      expectCategoryValueRefs([
        'StartEvent_2',
        'Task_2',
        'SequenceFlow_2'
      ], [ categoryValue ]);
    }));


    it('when moving a connection out of a group', inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('StartEvent_1'),
          target = elementRegistry.get('Task_1');

      // when
      modeling.moveShape(source, { x: 0, y: 250 });
      modeling.moveShape(target, { x: 0, y: 250 });

      // then
      expectCategoryValueRefs([
        'StartEvent_1',
        'Task_1',
        'SequenceFlow_1'
      ], []);
    }));


    it('when reconnecting a connection outside a group', inject(function(elementRegistry, modeling) {

      // given
      var connection = elementRegistry.get('SequenceFlow_1'),
          target = elementRegistry.get('Task_2');

      // when
      modeling.reconnectEnd(connection, target, { x: target.x, y: target.y });

      // then
      expectCategoryValueRefs([ 'SequenceFlow_1' ], []);
    }));


    it('when creating a flow element inside a group', inject(function(elementRegistry, modeling) {

      // given
      var categoryValue = getCategoryValue('Group_1');

      // when
      var task = modeling.createShape(
        { type: 'bpmn:Task' },
        { x: 300, y: 300 },
        elementRegistry.get('Process_1')
      );

      // then
      expect(getBusinessObject(task).get('categoryValueRef')).to.eql([ categoryValue ]);
    }));


    it('when creating a connection inside a group', inject(function(elementRegistry, modeling) {

      // given
      var source = elementRegistry.get('StartEvent_1'),
          target = elementRegistry.get('Task_1'),
          categoryValue = getCategoryValue('Group_1');

      // when
      var connection = modeling.connect(source, target);

      // then
      expect(getBusinessObject(connection).get('categoryValueRef')).to.eql([ categoryValue ]);
    }));


    it('when moving an external label', inject(function(elementRegistry, modeling) {

      // given
      var startEvent = elementRegistry.get('StartEvent_1'),
          categoryValue = getCategoryValue('Group_1');

      modeling.updateLabel(startEvent, 'Start event 1');

      // when
      modeling.moveShape(startEvent.label, { x: 1000, y: 0 });

      // then
      expect(getBusinessObject(startEvent).get('categoryValueRef')).to.eql([ categoryValue ]);
    }));


    it('when expanding and collapsing a subprocess inside a group', inject(
      function(elementRegistry, modeling) {

        // given
        var group = elementRegistry.get('Group_1'),
            subProcess = elementRegistry.get('SubProcess_2'),
            categoryValue = getCategoryValue('Group_1'),
            child = getBusinessObject(subProcess).get('flowElements')[0];

        // when
        modeling.moveShape(group, { x: 10, y: 0 });

        // then
        expect(child.get('categoryValueRef')).to.be.empty;

        // when
        modeling.toggleCollapse(subProcess);

        // then
        expect(child.get('categoryValueRef')).to.eql([ categoryValue ]);

        // when
        modeling.toggleCollapse(subProcess);

        // then
        expect(child.get('categoryValueRef')).to.be.empty;
      }
    ));

  });


  describe('should synchronize group references', function() {

    it('when creating an unlabeled group on top of flow elements', inject(
      function(canvas, elementRegistry, modeling) {

        // when
        var group = modeling.createShape(
          { type: 'bpmn:Group', width: 1090, height: 300 },
          { x: 705, y: 570 },
          canvas.getRootElement()
        );

        // then
        // the group is categorized up front ...
        var categoryValue = getBusinessObject(group).get('categoryValueRef');

        expect(categoryValue).to.exist;

        // ... so that visually enclosed flow elements can reference it
        expectCategoryValueRefs(
          flowElementsNotReferencingCategoryValue,
          [ categoryValue ]
        );
      }
    ));


    it('when moving a group', inject(
      function(commandStack, elementRegistry, modeling) {

        // given
        var group = elementRegistry.get('Group_1'),
            categoryValue = getCategoryValue('Group_1');

        // when
        modeling.moveShape(group, { x: 0, y: 310 });

        // then
        expectCategoryValueRefs(flowElementsReferencingCategoryValue, []);
        expectCategoryValueRefs(
          flowElementsNotReferencingCategoryValue,
          [ categoryValue ]
        );

        // when
        commandStack.undo();

        // then
        expectCategoryValueRefs(
          flowElementsReferencingCategoryValue,
          [ categoryValue ]
        );
        expectCategoryValueRefs(flowElementsNotReferencingCategoryValue, []);

        // when
        commandStack.redo();

        // then
        expectCategoryValueRefs(flowElementsReferencingCategoryValue, []);
        expectCategoryValueRefs(
          flowElementsNotReferencingCategoryValue,
          [ categoryValue ]
        );
      }
    ));


    it('when moving a group together with its enclosed flow elements', inject(
      function(elementRegistry, modeling) {

        // given
        var categoryValue = getCategoryValue('Group_1');

        // SubProcess_2 is a collapsed sub process, i.e. it has a plane sharing
        // its business object; moving it along with the group must not strip the
        // reference (cf. https://github.com/bpmn-io/bpmn-js/pull/2469)
        var elements = [
          'Group_1',
          'StartEvent_1',
          'Task_1',
          'SubProcess_1',
          'SubProcess_2'
        ].map(function(id) {
          return elementRegistry.get(id);
        });

        // when
        modeling.moveElements(elements, { x: 100, y: 50 });

        // then
        // references remain unchanged as the relative position did not change
        expectCategoryValueRefs(
          flowElementsReferencingCategoryValue,
          [ categoryValue ]
        );
      }
    ));


    it('when resizing a group', inject(function(elementRegistry, modeling) {

      // given
      var group = elementRegistry.get('Group_1');

      // when
      modeling.resizeShape(group, {
        x: group.x,
        y: group.y,
        width: group.width,
        height: 100
      });

      // then
      expectCategoryValueRefs([ 'Task_1' ], []);
    }));


    it('when resizing a group to include more flow elements', inject(function(elementRegistry, modeling) {

      // given
      var group = elementRegistry.get('Group_1'),
          categoryValue = getCategoryValue('Group_1');

      // when
      modeling.resizeShape(group, {
        x: group.x,
        y: group.y,
        width: group.width,
        height: 610
      });

      // then
      expectCategoryValueRefs(
        flowElementsReferencingCategoryValue,
        [ categoryValue ]
      );
      expectCategoryValueRefs(
        flowElementsNotReferencingCategoryValue,
        [ categoryValue ]
      );
    }));


    it('when moving a group so that a flow element is inside multiple groups', inject(
      function(elementRegistry, modeling) {

        // given
        var task = elementRegistry.get('Task_1'),
            group = elementRegistry.get('Group_3'),
            groupCategoryValue = getCategoryValue('Group_1'),
            overlappingGroupCategoryValue = getCategoryValue('Group_3');

        // when
        modeling.moveShape(group, { x: -1100, y: 5 });

        // then
        expect(getBusinessObject(task).get('categoryValueRef')).to.eql([
          groupCategoryValue,
          overlappingGroupCategoryValue
        ]);

        // when
        modeling.moveShape(group, { x: 1100, y: 0 });

        // then
        expect(getBusinessObject(task).get('categoryValueRef')).to.eql([
          groupCategoryValue
        ]);
      }
    ));


    it('when adding a category value to a group', inject(
      function(elementRegistry, modeling) {

        // given
        var group = elementRegistry.get('Group_2');

        // when
        modeling.updateLabel(group, 'Group 2');

        // then
        var categoryValue = getCategoryValue('Group_2');

        expect(categoryValue).to.exist;
        expectCategoryValueRefs([ 'LegacyTask_1' ], [ categoryValue ]);
      }
    ));


    it('when removing a group label', inject(function(elementRegistry, modeling) {

      // given
      var group = elementRegistry.get('Group_1'),
          categoryValue = getCategoryValue('Group_1');

      // when
      modeling.updateLabel(group, null);

      // then
      expect(group.label).not.to.exist;
      expect(getBusinessObject(group).get('categoryValueRef')).to.equal(categoryValue);
      expectCategoryValueRefs(
        flowElementsReferencingCategoryValue,
        [ categoryValue ]
      );
    }));


    it('when deleting a group', inject(
      function(bpmnjs, commandStack, elementRegistry, modeling) {

        // given
        var group = elementRegistry.get('Group_1'),
            categoryValue = getCategoryValue('Group_1'),
            category = categoryValue.$parent,
            definitions = bpmnjs.getDefinitions(),
            collapsedSubProcessChild = getBusinessObject(
              elementRegistry.get('SubProcess_2')
            ).get('flowElements')[0];

        // when
        modeling.removeShape(group);

        // then
        expectCategoryValueRefs(flowElementsReferencingCategoryValue, []);
        expect(collapsedSubProcessChild.get('categoryValueRef')).to.be.empty;
        expect(category.get('categoryValue')).to.be.empty;
        expect(definitions.get('rootElements')).not.to.include(category);

        // when
        commandStack.undo();

        // then
        expectCategoryValueRefs(
          flowElementsReferencingCategoryValue,
          [ categoryValue ]
        );
        expect(collapsedSubProcessChild.get('categoryValueRef')).to.be.empty;
        expect(definitions.get('rootElements')).to.include(category);

        // when
        commandStack.redo();

        // then
        expectCategoryValueRefs(flowElementsReferencingCategoryValue, []);
        expect(collapsedSubProcessChild.get('categoryValueRef')).to.be.empty;
        expect(definitions.get('rootElements')).not.to.include(category);
      }
    ));

  });


  describe('should auto-heal groups without a category value', function() {

    // Group_2 is modeled without a category value but visually encloses
    // LegacyTask_1 (as in legacy diagrams); interacting with its contents must
    // create a category value on the fly so the elements can be categorized
    // (cf. https://github.com/bpmn-io/bpmn-js/pull/2469)

    it('when moving a flow element inside the group', inject(
      function(bpmnjs, elementRegistry, modeling) {

        // given
        var task = elementRegistry.get('LegacyTask_1'),
            group = elementRegistry.get('Group_2'),
            definitions = bpmnjs.getDefinitions();

        // assume
        expect(getBusinessObject(group).get('categoryValueRef')).not.to.exist;

        // when
        modeling.moveShape(task, { x: 10, y: 0 });

        // then
        var categoryValue = getBusinessObject(group).get('categoryValueRef');

        expect(categoryValue).to.exist;
        expect(categoryValue.$parent).to.exist;
        expect(definitions.get('rootElements')).to.include(categoryValue.$parent);

        // the enclosed flow element is categorized
        expectCategoryValueRefs([ 'LegacyTask_1' ], [ categoryValue ]);
      }
    ));


    it('should not heal from an external label', inject(
      function(elementRegistry, modeling) {

        // given
        var group = elementRegistry.get('Group_2'),
            startEvent = elementRegistry.get('StartEvent_2');

        modeling.updateLabel(startEvent, 'Start event 2');

        // when
        modeling.moveShape(startEvent.label, { x: 0, y: 350 });

        // then
        expect(getBusinessObject(group).get('categoryValueRef')).not.to.exist;
      }
    ));


    it('when moving a flow element into the group from outside', inject(
      function(elementRegistry, modeling) {

        // given
        var task = elementRegistry.get('LegacyTask_2'),
            group = elementRegistry.get('Group_2');

        // assume
        expect(getBusinessObject(group).get('categoryValueRef')).not.to.exist;

        // when
        // move LegacyTask_2 up into Group_2's area
        modeling.moveShape(task, { x: 0, y: -300 });

        // then
        var categoryValue = getBusinessObject(group).get('categoryValueRef');

        expect(categoryValue).to.exist;

        // both the moved and the already enclosed flow element are categorized
        expectCategoryValueRefs(
          [ 'LegacyTask_1', 'LegacyTask_2' ],
          [ categoryValue ]
        );
      }
    ));


    it('should undo/redo healing', inject(
      function(bpmnjs, commandStack, elementRegistry, modeling) {

        // given
        var task = elementRegistry.get('LegacyTask_1'),
            group = elementRegistry.get('Group_2'),
            definitions = bpmnjs.getDefinitions();

        // when
        modeling.moveShape(task, { x: 10, y: 0 });

        var categoryValue = getBusinessObject(group).get('categoryValueRef'),
            category = categoryValue.$parent;

        // when
        commandStack.undo();

        // then
        // healing is reverted
        expect(getBusinessObject(group).get('categoryValueRef')).not.to.exist;
        expect(definitions.get('rootElements')).not.to.include(category);
        expectCategoryValueRefs([ 'LegacyTask_1' ], []);

        // when
        commandStack.redo();

        // then
        expect(getBusinessObject(group).get('categoryValueRef')).to.equal(categoryValue);
        expect(definitions.get('rootElements')).to.include(category);
        expectCategoryValueRefs([ 'LegacyTask_1' ], [ categoryValue ]);
      }
    ));


    it('when creating a flow element inside the group', inject(
      function(elementRegistry, modeling) {

        // given
        var group = elementRegistry.get('Group_2');

        // assume
        expect(getBusinessObject(group).get('categoryValueRef')).not.to.exist;

        // when
        var task = modeling.createShape(
          { type: 'bpmn:Task' },
          { x: 400, y: 960 },
          elementRegistry.get('Process_1')
        );

        // then
        var categoryValue = getBusinessObject(group).get('categoryValueRef');

        expect(categoryValue).to.exist;
        expect(getBusinessObject(task).get('categoryValueRef')).to.eql([ categoryValue ]);
      }
    ));


    it('when resizing the group to include a flow element', inject(
      function(bpmnjs, elementRegistry, modeling) {

        // given
        var group = elementRegistry.get('Group_2'),
            definitions = bpmnjs.getDefinitions();

        // assume
        expect(getBusinessObject(group).get('categoryValueRef')).not.to.exist;

        // when
        // grow Group_2 downwards so that it also encloses LegacyTask_2
        modeling.resizeShape(group, {
          x: group.x,
          y: group.y,
          width: group.width,
          height: 610
        });

        // then
        var categoryValue = getBusinessObject(group).get('categoryValueRef');

        expect(categoryValue).to.exist;
        expect(definitions.get('rootElements')).to.include(categoryValue.$parent);

        // both enclosed flow elements are categorized
        expectCategoryValueRefs(
          [ 'LegacyTask_1', 'LegacyTask_2' ],
          [ categoryValue ]
        );
      }
    ));


    it('when moving the group onto a flow element', inject(
      function(elementRegistry, modeling) {

        // given
        var group = elementRegistry.get('Group_2');

        // assume
        expect(getBusinessObject(group).get('categoryValueRef')).not.to.exist;

        // when
        // move Group_2 down so that it now encloses LegacyTask_2 instead of
        // LegacyTask_1
        modeling.moveShape(group, { x: 0, y: 300 });

        // then
        var categoryValue = getBusinessObject(group).get('categoryValueRef');

        expect(categoryValue).to.exist;

        expectCategoryValueRefs([ 'LegacyTask_2' ], [ categoryValue ]);
        expectCategoryValueRefs([ 'LegacyTask_1' ], []);
      }
    ));

  });


  describe('should copy category values', function() {

    it('when copying and pasting a group', inject(function(canvas, copyPaste, elementRegistry) {

      // given
      var group = elementRegistry.get('Group_1'),
          task = elementRegistry.get('Task_1'),
          sourceCategoryValue = getCategoryValue('Group_1');

      copyPaste.copy([ group, task ]);

      // when
      var pastedElements = copyPaste.paste({
        element: canvas.getRootElement(),
        point: { x: 2500, y: 800 }
      });

      // then
      var pastedGroup = find(pastedElements, function(element) {
            return element.type === 'bpmn:Group';
          }),
          pastedTask = find(pastedElements, function(element) {
            return element.type === 'bpmn:Task';
          }),
          categoryValue = getBusinessObject(pastedGroup).get('categoryValueRef');

      expect(categoryValue).not.to.equal(sourceCategoryValue);
      expect(getBusinessObject(pastedTask).get('categoryValueRef')).to.eql([ categoryValue ]);
      expect(getBusinessObject(task).get('categoryValueRef')).to.eql([ sourceCategoryValue ]);
    }));

  });

});


describe('features/modeling - categoryValueRefs in collaboration', function() {

  var diagramXML = require('./UpdateCategoryValueRefs.collaboration.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule
    ]
  }));


  it('should synchronize participant flow elements when a group is moved', inject(
    function(elementRegistry, modeling) {

      // given
      var group = elementRegistry.get('Group_1'),
          categoryValue = getCategoryValue('Group_1');

      // when
      modeling.moveShape(group, { x: 500, y: 0 });

      // then
      expectCategoryValueRefs([ 'Task_1' ], []);

      // when
      modeling.moveShape(group, { x: -500, y: 0 });

      // then
      expectCategoryValueRefs([ 'Task_1' ], [ categoryValue ]);
    }
  ));

});

/**
 * @param {string} id
 *
 * @return {import('diagram-js/lib/model').Element}
 */
function findElement(id) {

  return getBpmnJS().invoke((elementRegistry) => {

    const element = elementRegistry.get(id);

    expect(element, `element <#${id}>`).to.exist;

    return element;
  });
}

/**
 * @param {string} groupId
 *
 * @return {any} category value ref
 */
function getCategoryValue(groupId) {
  return getBusinessObject(findElement(groupId)).get('categoryValueRef');
}

function expectCategoryValueRefs(elementIds, expectedCategoryValueRefs) {

  for (const elementId of elementIds) {
    var businessObject = getBusinessObject(findElement(elementId));

    expect(businessObject.get('categoryValueRef')).to.eql(expectedCategoryValueRefs);
  }
}
