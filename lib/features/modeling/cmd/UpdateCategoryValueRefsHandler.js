import {
  add as collectionAdd,
  remove as collectionRemove
} from 'diagram-js/lib/util/Collections';

import {
  getEnclosedElements
} from 'diagram-js/lib/util/Elements';

import {
  getBusinessObject,
  is
} from '../../../util/ModelUtil';

import {
  getCategorizedFlowElements,
  unlinkCategory,
  unlinkCategoryValue
} from '../behavior/util/CategoryUtil';

/**
 * @typedef {import('diagram-js/lib/command/CommandHandler').default} CommandHandler
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 *
 * @typedef {import('../../../model/Types').Element} Element
 * @typedef {import('../../../model/Types').ModdleElement} ModdleElement
 */

var CATEGORY_VALUE_REFS_ATTR = 'categoryValueRef';


/**
 * Updates the category references of flow elements affected by group changes.
 *
 * @implements {CommandHandler}
 *
 * @param {ElementRegistry} elementRegistry
 * @param {import('../../../Modeler').default} bpmnjs
 */
export default function UpdateCategoryValueRefsHandler(elementRegistry, bpmnjs) {
  this._elementRegistry = elementRegistry;
  this._bpmnjs = bpmnjs;
}

UpdateCategoryValueRefsHandler.$inject = [
  'elementRegistry',
  'bpmnjs'
];


/**
 * @param { {
 *   shape: Element;
 *   parents: Element[];
 * }[] } flowElementEntries
 * @param { {
 *   categoryValue: ModdleElement;
 *   parent: Element;
 *   shape: Element;
 * }[] } groupEntries
 *
 * @return { {
 *   flowElement: ModdleElement;
 *   add: ModdleElement[];
 *   remove: ModdleElement[];
 * }[] }
 */
UpdateCategoryValueRefsHandler.prototype._computeUpdates = function(flowElementEntries, groupEntries) {
  var elementRegistry = this._elementRegistry;

  var flowElements = [];

  var groups = [];

  function addGroup(groupShape, categoryValue, parent, isPresent) {
    if (!categoryValue || groups.some(function(group) {
      return group.shape === groupShape &&
        group.categoryValue === categoryValue &&
        group.parent === parent &&
        group.isPresent === isPresent;
    })) {
      return;
    }

    groups.push({
      categoryValue: categoryValue,
      isPresent: isPresent,
      parent: parent,
      shape: groupShape
    });
  }

  function addFlowElement(flowElementShape, parent) {
    var flowElement = flowElements.find(function(flowElement) {
      return flowElement.shape === flowElementShape;
    });

    if (!flowElement) {
      flowElement = {
        parents: [],
        shape: flowElementShape
      };

      flowElements.push(flowElement);
    }

    collectionAdd(flowElement.parents, parent, true);
    collectionAdd(flowElement.parents, flowElementShape.parent, true);
  }

  function getCategoryValues(groups) {
    return groups.reduce(function(categoryValues, group) {
      collectionAdd(categoryValues, group.categoryValue, true);

      return categoryValues;
    }, []);
  }

  function isEnclosed(flowElementShape, groupShape) {
    return getEnclosedElements([ flowElementShape ], groupShape)[flowElementShape.id];
  }

  function isInGroupScope(flowElementShape, groupParent) {
    if (flowElementShape.parent === groupParent) {
      return true;
    }

    return is(groupParent, 'bpmn:Collaboration') &&
      is(flowElementShape.parent, 'bpmn:Participant') &&
      flowElementShape.parent.parent === groupParent;
  }

  elementRegistry.filter(function(element) {
    return is(element, 'bpmn:Group') && !element.labelTarget && element.parent;
  }).forEach(function(groupShape) {
    addGroup(
      groupShape,
      getBusinessObject(groupShape).categoryValueRef,
      groupShape.parent,
      true
    );
  });

  groupEntries.forEach(function(groupEntry) {
    var groupShape = groupEntry.shape,
        parents = [];

    addGroup(
      groupShape,
      groupEntry.categoryValue,
      groupEntry.parent,
      false
    );

    collectionAdd(parents, groupEntry.parent, true);
    collectionAdd(parents, groupShape.parent, true);

    parents.forEach(function(parent) {
      elementRegistry.filter(function(element) {
        return is(element, 'bpmn:FlowElement') &&
          isInGroupScope(element, parent);
      }).forEach(function(flowElementShape) {
        addFlowElement(flowElementShape, parent);
      });
    });
  });

  flowElementEntries.forEach(function(flowElementEntry) {
    flowElementEntry.parents.forEach(function(parent) {
      addFlowElement(flowElementEntry.shape, parent);
    });
  });

  return flowElements.reduce(function(updates, flowElementEntry) {
    var flowElementShape = flowElementEntry.shape,
        parents = flowElementEntry.parents,
        relevantGroups = groups.filter(function(group) {
          return parents.some(function(parent) {
            return isInGroupScope({ parent: parent }, group.parent);
          });
        }),
        categoryValues = getCategoryValues(relevantGroups),
        flowElement = getBusinessObject(flowElementShape),
        categoryValueRefs = flowElement.get(CATEGORY_VALUE_REFS_ATTR),
        add = [],
        remove = [];

    categoryValues.forEach(function(categoryValue) {
      var isCategorized = groups.some(function(group) {
        return group.isPresent &&
          isInGroupScope(flowElementShape, group.parent) &&
          group.categoryValue === categoryValue &&
          isEnclosed(flowElementShape, group.shape);
      });

      if (isCategorized && categoryValueRefs.indexOf(categoryValue) === -1) {
        add.push(categoryValue);
      } else if (!isCategorized && categoryValueRefs.indexOf(categoryValue) !== -1) {
        remove.push(categoryValue);
      }
    });

    if (add.length || remove.length) {
      updates.push({
        flowElement: flowElement,
        add: add,
        remove: remove
      });
    }

    return updates;
  }, []);
};


UpdateCategoryValueRefsHandler.prototype.execute = function(context) {
  var updates = context.updates;

  if (!updates) {
    updates = context.updates = this._computeUpdates(
      context.flowElementEntries,
      context.groupEntries
    );
  }

  updates.forEach(applyUpdate);

  cleanupUnusedCategoryValues(
    context.groupEntries,
    this._elementRegistry,
    this._bpmnjs.getDefinitions()
  );

  return [];
};


UpdateCategoryValueRefsHandler.prototype.revert = function(context) {
  var updates = context.updates;

  updates.forEach(revertUpdate);

  return [];
};


function applyUpdate(update) {
  var flowElement = update.flowElement,
      categoryValueRefs = flowElement.get(CATEGORY_VALUE_REFS_ATTR);

  update.remove.forEach(function(categoryValue) {
    collectionRemove(categoryValueRefs, categoryValue);
  });

  update.add.forEach(function(categoryValue) {
    collectionAdd(categoryValueRefs, categoryValue, true);
  });
}


function revertUpdate(update) {
  var flowElement = update.flowElement,
      categoryValueRefs = flowElement.get(CATEGORY_VALUE_REFS_ATTR);

  update.add.forEach(function(categoryValue) {
    collectionRemove(categoryValueRefs, categoryValue);
  });

  update.remove.forEach(function(categoryValue) {
    collectionAdd(categoryValueRefs, categoryValue, true);
  });
}


function cleanupUnusedCategoryValues(groupEntries, elementRegistry, definitions) {
  getCategoryValues(groupEntries).forEach(function(categoryValue) {
    var category = categoryValue.$parent,
        isReferenced = elementRegistry.filter(function(element) {
          return is(element, 'bpmn:Group') &&
            element.parent &&
            getBusinessObject(element).categoryValueRef === categoryValue;
        }).length > 0;

    if (category &&
        !isReferenced &&
        !getCategorizedFlowElements(definitions, categoryValue).length) {
      unlinkCategoryValue(categoryValue);

      if (!category.get('categoryValue').length) {
        unlinkCategory(category);
      }
    }
  });
}


function getCategoryValues(groupEntries) {
  return groupEntries.reduce(function(categoryValues, groupEntry) {
    collectionAdd(categoryValues, groupEntry.categoryValue, true);

    return categoryValues;
  }, []).filter(Boolean);
}
