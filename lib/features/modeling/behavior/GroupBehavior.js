import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  add as collectionAdd,
  remove as collectionRemove
} from 'diagram-js/lib/util/Collections';

import {
  getBusinessObject,
  is
} from '../../../util/ModelUtil';

import {
  createCategoryValue
} from './util/CategoryUtil';

var HIGH_PRIORITY = 2000;


/**
 * BPMN specific Group behavior
 */
export default function GroupBehavior(
    bpmnFactory,
    canvas,
    elementRegistry,
    eventBus,
    injector,
    moddleCopy
) {
  injector.invoke(CommandInterceptor, this);

  /**
   * Gets process definitions
   *
   * @return {ModdleElement} definitions
   */
  function getDefinitions() {
    var rootElement = canvas.getRootElement(),
        businessObject = getBusinessObject(rootElement);

    return businessObject.$parent;
  }

  /**
   * Removes a referenced category value for a given group shape
   *
   * @param {djs.model.Shape} shape
   */
  function removeReferencedCategoryValue(shape) {

    var businessObject = getBusinessObject(shape),
        categoryValue = businessObject.categoryValueRef;

    if (!categoryValue) {
      return;
    }

    var category = categoryValue.$parent;

    if (!categoryValue) {
      return;
    }

    collectionRemove(category.categoryValue, categoryValue);

    // cleanup category if it is empty
    if (category && !category.categoryValue.length) {
      removeCategory(category);
    }
  }

  /**
   * Removes a given category from the definitions
   *
   * @param {ModdleElement} category
   */
  function removeCategory(category) {

    var definitions = getDefinitions();

    collectionRemove(definitions.get('rootElements'), category);
  }

  /**
   * Returns all group element in the current registry
   *
   * @return {Array<djs.model.shape>} a list of group shapes
   */
  function getGroupElements() {
    return elementRegistry.filter(function(e) {
      return is(e, 'bpmn:Group');
    });
  }

  /**
   * Returns true if given categoryValue is referenced in one of the given elements
   *
   * @param {Array<djs.model.shape>} elements
   * @param {ModdleElement} categoryValue
   * @return {Boolean}
   */
  function isReferenced(elements, categoryValue) {
    return elements.some(function(e) {

      var businessObject = getBusinessObject(e);

      return businessObject.categoryValueRef
        && businessObject.categoryValueRef === categoryValue;
    });
  }

  /**
   * remove referenced category + value when group was deleted
   */
  this.executed('shape.delete', function(event) {

    var context = event.context,
        shape = context.shape;

    if (is(shape, 'bpmn:Group')) {

      var businessObject = getBusinessObject(shape),
          categoryValueRef = businessObject.categoryValueRef,
          groupElements = getGroupElements();

      if (!isReferenced(groupElements, categoryValueRef)) {
        removeReferencedCategoryValue(shape);
      }
    }
  });

  /**
   * re-attach removed category
   */
  this.reverted('shape.delete', function(event) {

    var context = event.context,
        shape = context.shape;

    if (is(shape, 'bpmn:Group')) {

      var businessObject = getBusinessObject(shape),
          categoryValueRef = businessObject.categoryValueRef,
          definitions = getDefinitions(),
          category = categoryValueRef ? categoryValueRef.$parent : null;

      collectionAdd(category.get('categoryValue'), categoryValueRef);
      collectionAdd(definitions.get('rootElements'), category);
    }
  });

  /**
   * create new category + value when group was created
   */
  this.execute('shape.create', function(event) {
    var context = event.context,
        shape = context.shape,
        businessObject = getBusinessObject(shape);

    if (is(businessObject, 'bpmn:Group') && !businessObject.categoryValueRef) {

      var definitions = getDefinitions(),
          categoryValue = createCategoryValue(definitions, bpmnFactory);

      // link the reference to the Group
      businessObject.categoryValueRef = categoryValue;
    }
  });


  this.revert('shape.create', function(event) {

    var context = event.context,
        shape = context.shape;

    if (is(shape, 'bpmn:Group')) {
      removeReferencedCategoryValue(shape);

      delete getBusinessObject(shape).categoryValueRef;

    }
  });

  // copy bpmn:CategoryValue when copying element
  eventBus.on('moddleCopy.canCopyProperty', HIGH_PRIORITY, function(context) {
    var property = context.property,
        categoryValue;

    if (is(property, 'bpmn:CategoryValue')) {
      categoryValue = createCategoryValue(getDefinitions(), bpmnFactory);

      // return copy of category
      return moddleCopy.copyElement(property, categoryValue);
    }
  });

}

GroupBehavior.$inject = [
  'bpmnFactory',
  'canvas',
  'elementRegistry',
  'eventBus',
  'injector',
  'moddleCopy'
];

inherits(GroupBehavior, CommandInterceptor);