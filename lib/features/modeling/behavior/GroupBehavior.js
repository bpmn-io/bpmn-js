import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  getBusinessObject,
  is
} from '../../../util/ModelUtil';

import {
  createCategory,
  createCategoryValue,
  linkCategoryValue,
  unlinkCategory,
  unlinkCategoryValue
} from './util/CategoryUtil';

/**
 * @typedef {import('../BpmnFactory').default} BpmnFactory
 * @typedef {import('../../../Modeler').default} Modeler
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('didi').Injector} Injector
 * @typedef {import('../../copy-paste/ModdleCopy').default} ModdleCopy
 *
 * @typedef {import('../../../model/Types').Element} Element
 * @typedef {import('../../../model/Types').Shape} Shape
 *
 * @typedef {import('diagram-js/lib/util/Types').DirectionTRBL} DirectionTRBL
 */

var LOWER_PRIORITY = 770;


/**
 * BPMN specific group behavior.
 *
 * @param {BpmnFactory} bpmnFactory
 * @param {Modeler} bpmnjs
 * @param {ElementRegistry} elementRegistry
 * @param {EventBus} eventBus
 * @param {Injector} injector
 * @param {ModdleCopy} moddleCopy
 */
export default function GroupBehavior(
    bpmnFactory,
    bpmnjs,
    elementRegistry,
    eventBus,
    injector,
    moddleCopy
) {
  injector.invoke(CommandInterceptor, this);

  /**
   * Returns all group element in the current registry.
   *
   * @return {Shape[]}
   */
  function getGroupElements() {
    return elementRegistry.filter(function(e) {
      return is(e, 'bpmn:Group');
    });
  }

  /**
   * Returns true if given category is referenced in one of the given elements.
   *
   * @param {Element[]} elements
   * @param {ModdleElement} category
   *
   * @return {boolean}
   */
  function isReferencedCategory(elements, category) {
    return elements.some(function(element) {
      var businessObject = getBusinessObject(element);

      var _category = businessObject.categoryValueRef && businessObject.categoryValueRef.$parent;

      return _category === category;
    });
  }

  /**
   * Returns true if given categoryValue is referenced in one of the given elements.
   *
   * @param {Element[]} elements
   * @param {ModdleElement} categoryValue
   *
   * @return {boolean}
   */
  function isReferencedCategoryValue(elements, categoryValue) {
    return elements.some(function(element) {
      var businessObject = getBusinessObject(element);

      return businessObject.categoryValueRef === categoryValue;
    });
  }

  /**
   * Remove category value unless it is still referenced.
   *
   * @param {ModdleElement} categoryValue
   * @param {ModdleElement} category
   * @param {ModdleElement} businessObject
   */
  function removeCategoryValue(categoryValue, category, businessObject) {

    var groups = getGroupElements().filter(function(element) {
      return element.businessObject !== businessObject;
    });

    if (category && !isReferencedCategory(groups, category)) {
      unlinkCategory(category);
    }

    if (categoryValue && !isReferencedCategoryValue(groups, categoryValue)) {
      unlinkCategoryValue(categoryValue);
    }
  }

  /**
   * Add category value.
   *
   * @param {ModdleElement} categoryValue
   * @param {ModdleElement} category
   *
   * @return {ModdleElement}
   */
  function addCategoryValue(categoryValue, category) {
    return linkCategoryValue(categoryValue, category, bpmnjs.getDefinitions());
  }

  function setCategoryValue(element, context) {
    var businessObject = getBusinessObject(element),
        categoryValue = businessObject.categoryValueRef;

    if (!categoryValue) {
      categoryValue =
      businessObject.categoryValueRef =
      context.categoryValue = (
        context.categoryValue || createCategoryValue(bpmnFactory)
      );
    }

    var category = categoryValue.$parent;

    if (!category) {
      category =
      categoryValue.$parent =
      context.category = (
        context.category || createCategory(bpmnFactory)
      );
    }

    addCategoryValue(categoryValue, category, bpmnjs.getDefinitions());
  }

  function unsetCategoryValue(element, context) {
    var category = context.category,
        categoryValue = context.categoryValue,
        businessObject = getBusinessObject(element);

    if (categoryValue) {
      businessObject.categoryValueRef = null;

      removeCategoryValue(categoryValue, category, businessObject);
    } else {
      removeCategoryValue(null, businessObject.categoryValueRef.$parent, businessObject);
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

    var categoryValue = context.categoryValue = businessObject.categoryValueRef,
        category;

    if (categoryValue) {
      category = context.category = categoryValue.$parent;

      removeCategoryValue(categoryValue, category, businessObject);

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

      addCategoryValue(categoryValue, category);
    }
  });


  // create new category + value when group was created

  this.execute('shape.create', function(event) {
    var context = event.context,
        shape = context.shape;

    if (!is(shape, 'bpmn:Group') || shape.labelTarget) {
      return;
    }

    if (getBusinessObject(shape).categoryValueRef) {
      setCategoryValue(shape, context);
    }
  });

  this.reverted('shape.create', function(event) {

    var context = event.context,
        shape = context.shape;

    if (!is(shape, 'bpmn:Group') || shape.labelTarget) {
      return;
    }

    if (getBusinessObject(shape).categoryValueRef) {
      unsetCategoryValue(shape, context);
    }
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
  'bpmnjs',
  'elementRegistry',
  'eventBus',
  'injector',
  'moddleCopy'
];

inherits(GroupBehavior, CommandInterceptor);