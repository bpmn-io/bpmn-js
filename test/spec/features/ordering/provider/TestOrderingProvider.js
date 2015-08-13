'use strict';

var inherits = require('inherits');

var OrderingProvider = require('../../../../../lib/features/ordering/OrderingProvider');


var findIndex = require('lodash/array/findIndex');


/**
 * a simple ordering provider that makes sure:
 *
 * (1) elements are ordered by a {level} property
 * (2) elements with {alwaysTopLevel} are always added to the root
 */
function TestOrderingProvider(eventBus) {

  OrderingProvider.call(this, eventBus);


  this.getOrdering = function(element, newParent) {

    if (element.alwaysTopLevel) {
      while (newParent.parent) {
        newParent = newParent.parent;
      }
    }


    var currentIndex = newParent.children.indexOf(element);

    var insertIndex = findIndex(newParent.children, function(c) {
      return element.level < c.level;
    });


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

inherits(TestOrderingProvider, OrderingProvider);

module.exports = TestOrderingProvider;