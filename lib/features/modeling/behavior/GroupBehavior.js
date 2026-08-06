import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  getBusinessObject,
  is
} from '../../../util/ModelUtil';

import {
  getOrCreateCategoryValueForGroup,
  createCategory
} from './util/CategoryUtil';

/**
 * @typedef {import('../BpmnFactory').default} BpmnFactory
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 * @typedef {import('didi').Injector} Injector
 * @typedef {import('../../copy-paste/ModdleCopy').default} ModdleCopy
 */

var LOWER_PRIORITY = 770;


/**
 * BPMN specific group behavior.
 *
 * @param {BpmnFactory} bpmnFactory
 * @param {EventBus} eventBus
 * @param {Injector} injector
 * @param {ModdleCopy} moddleCopy
 */
export default function GroupBehavior(
    bpmnFactory,
    eventBus,
    injector,
    moddleCopy
) {
  injector.invoke(CommandInterceptor, this);

  function setCategoryValue(element, context) {
    var businessObject = getBusinessObject(element),
        categoryValue = context.categoryValue || businessObject.categoryValueRef;

    if (!categoryValue) {
      categoryValue = getOrCreateCategoryValueForGroup(bpmnFactory, businessObject);
    }

    var category = context.category || categoryValue.$parent || createCategory(bpmnFactory);

    businessObject.categoryValueRef = categoryValue;
    categoryValue.$parent = category;

    context.categoryValue = categoryValue;
    context.category = category;
  }

  function unsetCategoryValue(element, context) {
    var businessObject = getBusinessObject(element),
        categoryValue = context.categoryValue || businessObject.categoryValueRef,
        category = context.category || (categoryValue && categoryValue.$parent);

    if (categoryValue) {
      context.categoryValue = categoryValue;
      context.category = category;

      businessObject.categoryValueRef = null;
    }
  }


  // ensure category + value exist before label editing

  this.execute('label.create', function(event) {
    var context = event.context,
        labelTarget = context.labelTarget;

    if (!is(labelTarget, 'bpmn:Group')) {
      return;
    }

    setCategoryValue(labelTarget, context);
  });

  this.revert('label.create', function(event) {
    var context = event.context,
        labelTarget = context.labelTarget;

    if (!is(labelTarget, 'bpmn:Group')) {
      return;
    }

    unsetCategoryValue(labelTarget, context);
  });


  // remove referenced category + value when group was deleted

  this.execute('shape.delete', function(event) {

    var context = event.context,
        shape = context.shape,
        businessObject = getBusinessObject(shape);

    if (!is(shape, 'bpmn:Group') || shape.labelTarget) {
      return;
    }

    var categoryValue = context.categoryValue = businessObject.categoryValueRef;

    if (categoryValue) {
      context.category = categoryValue.$parent;
      businessObject.categoryValueRef = null;
    }
  });

  this.reverted('shape.delete', function(event) {

    var context = event.context,
        shape = context.shape;

    if (!is(shape, 'bpmn:Group') || shape.labelTarget) {
      return;
    }

    var category = context.category,
        categoryValue = context.categoryValue,
        businessObject = getBusinessObject(shape);

    if (categoryValue) {
      businessObject.categoryValueRef = categoryValue;
      categoryValue.$parent = category;
    }
  });


  // create new category + value when group was created so that visually
  // enclosed elements can be categorized against it, even if it is unlabeled

  this.execute('shape.create', function(event) {
    var context = event.context,
        shape = context.shape,
        hints = context.hints || {};

    if (!is(shape, 'bpmn:Group') || shape.labelTarget) {
      return;
    }

    // during paste the category value (if any) is carried over from the
    // source; only fabricate one for genuinely new groups
    if (hints.createElementsBehavior === false &&
        !getBusinessObject(shape).categoryValueRef &&
        !context.categoryValue) {
      return;
    }

    setCategoryValue(shape, context);
  });

  this.reverted('shape.create', function(event) {

    var context = event.context,
        shape = context.shape,
        hints = context.hints || {};

    if (!is(shape, 'bpmn:Group') || shape.labelTarget) {
      return;
    }

    if (hints.createElementsBehavior === false &&
        !getBusinessObject(shape).categoryValueRef &&
        !context.categoryValue) {
      return;
    }

    unsetCategoryValue(shape, context);
  });


  // add category -> categoryValue for groups when they change

  this.executed([ 'shape.move', 'shape.resize' ], function(event) {
    var context = event.context,
        shape = context.shape;

    if (!is(shape, 'bpmn:Group') || shape.labelTarget ||
        getBusinessObject(shape).categoryValueRef) {
      return;
    }

    setCategoryValue(shape, context);
  });

  this.reverted([ 'shape.move', 'shape.resize' ], function(event) {
    var context = event.context,
        shape = context.shape;

    if (!is(shape, 'bpmn:Group') || shape.labelTarget || !context.categoryValue) {
      return;
    }

    unsetCategoryValue(shape, context);
  });


  // copy + paste categoryValueRef with group

  function copy(bo, clone) {
    var targetBo = bpmnFactory.create(bo.$type);

    return moddleCopy.copyElement(bo, targetBo, null, clone);
  }

  eventBus.on('copyPaste.copyElement', LOWER_PRIORITY, function(context) {
    var descriptor = context.descriptor,
        element = context.element;

    if (!is(element, 'bpmn:Group') || element.labelTarget) {
      return;
    }

    var groupBo = getBusinessObject(element);

    if (groupBo.categoryValueRef) {

      var categoryValue = groupBo.categoryValueRef;

      descriptor.categoryValue = copy(categoryValue, true);

      if (categoryValue.$parent) {
        descriptor.category = copy(categoryValue.$parent, true);
      }
    }
  });

  eventBus.on('copyPaste.pasteElement', LOWER_PRIORITY, function(context) {
    var descriptor = context.descriptor,
        businessObject = descriptor.businessObject,
        categoryValue = descriptor.categoryValue,
        category = descriptor.category;

    if (categoryValue) {
      categoryValue = businessObject.categoryValueRef = copy(categoryValue);
    }

    if (category) {
      categoryValue.$parent = copy(category);
    }

    delete descriptor.category;
    delete descriptor.categoryValue;
  });

}

GroupBehavior.$inject = [
  'bpmnFactory',
  'eventBus',
  'injector',
  'moddleCopy'
];

inherits(GroupBehavior, CommandInterceptor);