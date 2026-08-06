import {
  add as collectionAdd,
  remove as collectionRemove
} from 'diagram-js/lib/util/Collections';

import {
  getEnclosedElements
} from 'diagram-js/lib/util/Elements';

import {
  isLabel
} from '../../../util/LabelUtil';

import {
  getBusinessObject,
  is
} from '../../../util/ModelUtil';

import {
  getOrCreateCategoryValueForGroup
} from '../behavior/util/CategoryUtil';

/**
 * @typedef {import('diagram-js/lib/command/CommandHandler').default} CommandHandler
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 * @typedef {import('../BpmnFactory').default} BpmnFactory
 *
 * @typedef {import('../../../model/Types').Element} Element
 * @typedef {import('../../../model/Types').ModdleElement} ModdleElement
 *
 * @typedef { {
 *   categoryValue: ModdleElement;
 *   root?: Element;
 * } } CategoryGroupEntry
 */

var CATEGORY_VALUE_REFS_ATTR = 'categoryValueRef';


/**
 * Updates category value references for flow elements visually enclosed by groups.
 *
 * A flow element is grouped only when it shares the group's diagram root and
 * is geometrically enclosed by the group. Consequently, visible children of an
 * expanded subprocess are grouped, while children of a collapsed subprocess
 * are not.
 *
 * Groups without a category value are auto-healed: if such a group visually
 * encloses an affected flow element a category value is created for it on the
 * fly, so that legacy diagrams (groups modeled without a category value) start
 * to categorize their contents as soon as they are interacted with.
 *
 * @implements {CommandHandler}
 *
 * @param {BpmnFactory} bpmnFactory
 * @param {ElementRegistry} elementRegistry
 */
export default function UpdateCategoryValueRefsHandler(bpmnFactory, elementRegistry) {
  this._bpmnFactory = bpmnFactory;
  this._elementRegistry = elementRegistry;
}

UpdateCategoryValueRefsHandler.$inject = [
  'bpmnFactory',
  'elementRegistry'
];


/**
 * @param { Element[] } affectedFlowElements
 * @param { {
 *   categoryValue: ModdleElement;
 *   groupShape: Element;
 * }[] } affectedGroupEntries
 *
 * @return { {
 *   flowElements: {
 *     businessObject: ModdleElement;
 *     categoryValuesToAdd: ModdleElement[];
 *     categoryValuesToRemove: ModdleElement[];
 *   }[];
 *   groups: {
 *     groupShape: Element;
 *     categoryValue: ModdleElement;
 *     category: ModdleElement;
 *   }[];
 * } }
 */
UpdateCategoryValueRefsHandler.prototype._computeUpdates = function(affectedFlowElements, affectedGroupEntries) {
  var elementRegistry = this._elementRegistry,
      bpmnFactory = this._bpmnFactory;

  /** @type {Map<Element, ModdleElement>} */
  var flowElementBusinessObjects = new Map();

  var groupUpdates = [];

  /**
   * @type {Map<Element, {
   *   present?: CategoryGroupEntry;
   *   past?: CategoryGroupEntry;
   * }>}
   */
  var categoryGroups = new Map();

  /**
   * Adds a group to the list of groups to consider for category value updates.
   *
   * @param {Element} groupShape
   * @param {ModdleElement} categoryValue
   * @param {boolean} isPresent
   */
  function addGroup(groupShape, categoryValue, isPresent) {
    if (!categoryValue) {
      return;
    }

    var categoryGroup = categoryGroups.get(groupShape);

    if (!categoryGroup) {
      categoryGroup = {};
      categoryGroups.set(groupShape, categoryGroup);
    }

    if (isPresent && categoryGroup.present) {
      return;
    }

    if (!isPresent && categoryGroup.past) {
      return;
    }

    if (isPresent) {
      categoryGroup.present = {
        categoryValue: categoryValue,
        root: getRoot(groupShape)
      };
    } else {
      categoryGroup.past = {
        categoryValue: categoryValue
      };
    }
  }

  /**
   * Adds a flow element to the list of flow elements to consider for category
   * value updates.
   *
   * @param {Element} flowElement
   */
  function addFlowElement(flowElement) {
    flowElementBusinessObjects.set(
      flowElement,
      getBusinessObject(flowElement)
    );
  }

  /**
   * Adds all flow elements on the diagram to the list of flow elements to
   * consider; skips root elements (e.g. sub process planes) which share a
   * business object with their collapsed shape but carry no diagram position.
   */
  function addAllFlowElements() {
    elementRegistry.filter(function(element) {
      return is(element, 'bpmn:FlowElement') && !isLabel(element) && element.parent;
    }).forEach(addFlowElement);
  }

  /**
   * Returns a group's category value, creating one on the fly for
   * legacy groups modeled without one. Retrieving the value in order to
   * reference it materializes it; the fresh value is recorded as a heal so
   * CategoryRootElementReferenceBehavior can maintain its root element.
   *
   * @param {Element} groupShape
   *
   * @return {ModdleElement}
   */
  function getCategoryValue(groupShape) {
    var groupBo = getBusinessObject(groupShape),
        categoryValue = groupBo.get('categoryValueRef');

    if (!categoryValue) {
      categoryValue = getOrCreateCategoryValueForGroup(bpmnFactory, groupBo);

      groupUpdates.push(createGroupUpdate(groupShape, categoryValue));
    }

    return categoryValue;
  }

  function getElementsByRoot(elements) {
    return elements.reduce(function(elementsByRoot, element) {
      var root = getRoot(element),
          elementsInRoot = elementsByRoot.get(root);

      if (!elementsInRoot) {
        elementsInRoot = [];
        elementsByRoot.set(root, elementsInRoot);
      }

      elementsInRoot.push(element);

      return elementsByRoot;
    }, new Map());
  }

  affectedFlowElements = Array.from(affectedFlowElements || []);

  var affectedFlowElementsByRoot = getElementsByRoot(affectedFlowElements);

  // when a group is moved, resized, added or removed, the category value
  // references of all flow elements must be rechecked
  if (affectedGroupEntries.length) {
    addAllFlowElements();
  }

  // flow elements that were genuinely moved or created; unrelated groups
  // will not be touched
  affectedFlowElements.forEach(addFlowElement);

  // add all present groups to the list of groups to consider for category
  // value updates, auto-healing legacy groups only when an affected flow
  // element moves into them
  elementRegistry.filter(function(element) {
    return is(element, 'bpmn:Group') && !isLabel(element) && element.parent;
  }).forEach(function(groupShape) {
    var categoryValue = getBusinessObject(groupShape).get('categoryValueRef');

    if (!categoryValue) {
      var groupRoot = getRoot(groupShape),
          affectedFlowElementsInRoot = affectedFlowElementsByRoot.get(groupRoot) || [],
          enclosedAffectedFlowElements = getEnclosedElements(
            affectedFlowElementsInRoot,
            groupShape
          ),
          enclosesAffectedFlowElement = Object.keys(enclosedAffectedFlowElements).length > 0;

      if (enclosesAffectedFlowElement) {
        categoryValue = getCategoryValue(groupShape);
      }
    }

    addGroup(groupShape, categoryValue, true);
  });

  affectedGroupEntries.forEach(function(groupEntry) {
    addGroup(groupEntry.groupShape, groupEntry.categoryValue, false);
  });

  // a healed group receives a fresh category value; recheck all flow elements
  // so that everything it visually encloses is tagged consistently, not just
  // the flow element that triggered the healing
  if (groupUpdates.length) {
    addAllFlowElements();
  }

  var flowElements = Array.from(flowElementBusinessObjects.keys());

  var managedCategoryValues = Array.from(categoryGroups.values()).reduce(function(set, group) {
    if (group.present) {
      set.add(group.present.categoryValue);
    }

    if (group.past) {
      set.add(group.past.categoryValue);
    }

    return set;
  }, new Set());

  var categoryValuesByFlowElement = new Map(),
      flowElementsByRoot = getElementsByRoot(flowElements);

  // Containment is calculated once per group and diagram root. This avoids
  // allocating an enclosure result for every flow element / group pair.
  categoryGroups.forEach(function(categoryGroup, groupShape) {
    var presentGroup = categoryGroup.present;

    if (!presentGroup) {
      return;
    }

    var flowElementsInRoot = flowElementsByRoot.get(presentGroup.root) || [],
        enclosedFlowElements = getEnclosedElements(flowElementsInRoot, groupShape);

    flowElementsInRoot.forEach(function(flowElement) {
      if (!enclosedFlowElements[flowElement.id]) {
        return;
      }

      var categoryValues = categoryValuesByFlowElement.get(flowElement);

      if (!categoryValues) {
        categoryValues = new Set();
        categoryValuesByFlowElement.set(flowElement, categoryValues);
      }

      categoryValues.add(presentGroup.categoryValue);
    });
  });

  // compute updates for all flow elements based on the groups they are inside
  var flowElementUpdates = flowElements.reduce(function(flowElementUpdates, flowElement) {
    var flowElementBo = flowElementBusinessObjects.get(flowElement),
        categoryValueRefs = flowElementBo.get(CATEGORY_VALUE_REFS_ATTR),
        categoryValueRefSet = new Set(categoryValueRefs),
        enclosingCategoryValues = categoryValuesByFlowElement.get(flowElement) || new Set(),
        categoryValuesToAdd = Array.from(enclosingCategoryValues).filter(function(categoryValue) {
          return !categoryValueRefSet.has(categoryValue);
        }),
        categoryValuesToRemove = categoryValueRefs.filter(function(categoryValue) {
          return managedCategoryValues.has(categoryValue) &&
            !enclosingCategoryValues.has(categoryValue);
        });

    if (categoryValuesToAdd.length || categoryValuesToRemove.length) {
      flowElementUpdates.push({
        businessObject: flowElementBo,
        categoryValuesToAdd,
        categoryValuesToRemove
      });
    }

    return flowElementUpdates;
  }, []);

  return {
    flowElements: flowElementUpdates,
    groups: groupUpdates
  };
};


UpdateCategoryValueRefsHandler.prototype.execute = function(context) {
  var updates = context.updates;

  if (!updates) {
    updates = context.updates = this._computeUpdates(
      context.affectedFlowElements,
      context.affectedGroupEntries
    );
  }

  // set auto-healed category values first so that flow element updates can
  // reference them; root element linking is handled by
  // CategoryRootElementReferenceBehavior
  applyGroupUpdates(updates.groups);

  applyFlowElementUpdates(updates.flowElements);

  return [];
};


UpdateCategoryValueRefsHandler.prototype.revert = function(context) {
  var updates = context.updates;

  revertFlowElementUpdates(updates.flowElements);

  revertGroupUpdates(updates.groups);

  return [];
};


function createGroupUpdate(groupShape, categoryValue) {
  return {
    groupShape: groupShape,
    categoryValue: categoryValue,
    category: categoryValue.$parent
  };
}

function applyGroupUpdates(groupUpdates) {
  groupUpdates.forEach(function(groupUpdate) {
    getBusinessObject(groupUpdate.groupShape).categoryValueRef = groupUpdate.categoryValue;
    groupUpdate.categoryValue.$parent = groupUpdate.category;
  });
}

function revertGroupUpdates(groupUpdates) {
  groupUpdates.forEach(function(groupUpdate) {
    getBusinessObject(groupUpdate.groupShape).categoryValueRef = null;
  });
}

function applyFlowElementUpdates(flowElementUpdates) {
  flowElementUpdates.forEach(function(flowElementUpdate) {
    var businessObject = flowElementUpdate.businessObject,
        categoryValueRefs = businessObject.get(CATEGORY_VALUE_REFS_ATTR);

    flowElementUpdate.categoryValuesToRemove.forEach(function(categoryValue) {
      collectionRemove(categoryValueRefs, categoryValue);
    });

    flowElementUpdate.categoryValuesToAdd.forEach(function(categoryValue) {
      collectionAdd(categoryValueRefs, categoryValue, true);
    });
  });
}

function revertFlowElementUpdates(flowElementUpdates) {
  flowElementUpdates.forEach(function(flowElementUpdate) {
    var businessObject = flowElementUpdate.businessObject,
        categoryValueRefs = businessObject.get(CATEGORY_VALUE_REFS_ATTR);

    flowElementUpdate.categoryValuesToAdd.forEach(function(categoryValue) {
      collectionRemove(categoryValueRefs, categoryValue);
    });

    flowElementUpdate.categoryValuesToRemove.forEach(function(categoryValue) {
      collectionAdd(categoryValueRefs, categoryValue, true);
    });
  });
}

function getRoot(element) {
  while (element.parent) {
    element = element.parent;
  }

  return element;
}
