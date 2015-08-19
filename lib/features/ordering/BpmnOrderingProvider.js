'use strict';

var inherits = require('inherits');

var OrderingProvider = require('diagram-js/lib/features/ordering/OrderingProvider');


var findIndex = require('lodash/array/findIndex');

var find = require('lodash/collection/find');


/**
 * a simple ordering provider that makes sure:
 *
 * (1) elements are ordered by a {level} property
 * (2) elements with {alwaysOnTop} are always added to the root
 */
function BpmnOrderingProvider(eventBus) {

  OrderingProvider.call(this, eventBus);

  var orders = [
    { type: 'label', order: { level: 7 } },
    { type: 'bpmn:SequenceFlow', order: { level: 5 } },
    { type: 'bpmn:MessageFlow', order: { level: 6, top: true } },
    { type: 'bpmn:BoundaryEvent', order: { level: 4 } },
    { type: 'bpmn:Participant', order: { level: -2 } },
    { type: 'bpmn:Lane', order: { level: -1 } }
  ];

  function computeOrder(element) {
    var entry = find(orders, function(o) {
      return element.type === o.type;
    });

    return entry && entry.order || { level: 1 };
  }

  function getOrder(element) {

    var order = element.order;

    if (!order) {
      element.order = order = computeOrder(element);
    }

    return order;
  }

  this.getOrdering = function(element, newParent) {

    var elementOrder = getOrder(element);


    if (elementOrder.top) {
      while (newParent.parent) {
        newParent = newParent.parent;
      }
    }


    var currentIndex = newParent.children.indexOf(element);

    var insertIndex = findIndex(newParent.children, function(child) {
      return elementOrder.level < getOrder(child).level;
    });


    // if the element is already in the child list at
    // a smaller index, we need to adjust the inser index.
    // this takes into account that the element is being removed
    // before being re-inserted
    if (insertIndex !== -1) {
      if (currentIndex !== -1 && currentIndex < insertIndex) {
        insertIndex -= 1;
      }
    }

    return {
      index: insertIndex,
      parent: newParent
    };
  };
}

BpmnOrderingProvider.$inject = [ 'eventBus' ];

inherits(BpmnOrderingProvider, OrderingProvider);

module.exports = BpmnOrderingProvider;