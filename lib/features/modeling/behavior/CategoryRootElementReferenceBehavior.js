import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  getBusinessObject,
  is
} from '../../../util/ModelUtil';

import {
  linkCategoryValue,
  unlinkCategory,
  unlinkCategoryValue
} from './util/CategoryUtil';

var LOW_PRIORITY = 500;

/**
 * @typedef {import('../../../Modeler').default} Modeler
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 * @typedef {import('didi').Injector} Injector
 */

/**
 * Maintains a group's category (value) inside definitions#rootElements.
 *
 * @param {Modeler} bpmnjs
 * @param {ElementRegistry} elementRegistry
 * @param {Injector} injector
 */
export default function CategoryRootElementReferenceBehavior(
    bpmnjs, elementRegistry, injector
) {
  injector.invoke(CommandInterceptor, this);

  function getGroupBusinessObjects(ignoredBusinessObject) {
    return elementRegistry.filter(function(element) {
      return is(element, 'bpmn:Group') && !element.labelTarget;
    }).map(getBusinessObject).filter(function(businessObject) {
      return businessObject !== ignoredBusinessObject;
    });
  }

  function isCategoryValueReferenced(categoryValue, ignoredBusinessObject) {
    return getGroupBusinessObjects(ignoredBusinessObject).some(function(businessObject) {
      return businessObject.get('categoryValueRef') === categoryValue;
    });
  }

  function isCategoryReferenced(category, ignoredBusinessObject) {
    return getGroupBusinessObjects(ignoredBusinessObject).some(function(businessObject) {
      var categoryValue = businessObject.get('categoryValueRef');

      return categoryValue && categoryValue.$parent === category;
    });
  }

  function link(categoryValue, category) {
    if (categoryValue && category) {
      linkCategoryValue(categoryValue, category, bpmnjs.getDefinitions());
    }
  }

  function unlink(categoryValue, category, ignoredBusinessObject) {
    if (category && !isCategoryReferenced(category, ignoredBusinessObject)) {
      unlinkCategory(category);
    }

    if (categoryValue && !isCategoryValueReferenced(categoryValue, ignoredBusinessObject)) {
      unlinkCategoryValue(categoryValue);
    }
  }


  this.executed([ 'shape.create', 'label.create' ], function(context) {
    var shape = context.labelTarget || context.shape;

    if (!is(shape, 'bpmn:Group') || shape.labelTarget) {
      return;
    }

    link(context.categoryValue, context.category);
  }, true);

  this.reverted([ 'shape.create', 'label.create' ], function(context) {
    var shape = context.labelTarget || context.shape;

    if (!is(shape, 'bpmn:Group') || shape.labelTarget) {
      return;
    }

    unlink(context.categoryValue, context.category, getBusinessObject(shape));
  }, true);

  this.executed([ 'shape.move', 'shape.resize' ], LOW_PRIORITY, function(context) {
    link(context.categoryValue, context.category);
  }, true);

  this.reverted([ 'shape.move', 'shape.resize' ], function(context) {
    var shape = context.shape;

    if (context.categoryValue) {
      unlink(context.categoryValue, context.category, getBusinessObject(shape));
    }
  }, true);

  this.executed('group.updateRefs', function(context) {
    getGroupUpdates(context).forEach(function(update) {
      link(update.categoryValue, update.category);
    });
  }, true);

  this.reverted('group.updateRefs', function(context) {
    getGroupUpdates(context).forEach(function(update) {
      unlink(
        update.categoryValue,
        update.category,
        getBusinessObject(update.groupShape)
      );
    });
  }, true);

  this.executed('shape.delete', function(context) {
    var shape = context.shape;

    if (!is(shape, 'bpmn:Group') || shape.labelTarget) {
      return;
    }

    unlink(context.categoryValue, context.category, getBusinessObject(shape));
  }, true);

  this.reverted('shape.delete', function(context) {
    var shape = context.shape;

    if (!is(shape, 'bpmn:Group') || shape.labelTarget) {
      return;
    }

    link(context.categoryValue, context.category);
  }, true);
}

CategoryRootElementReferenceBehavior.$inject = [
  'bpmnjs',
  'elementRegistry',
  'injector'
];

inherits(CategoryRootElementReferenceBehavior, CommandInterceptor);


// helpers //////////

function getGroupUpdates(context) {
  return context.updates?.groups || [];
}
