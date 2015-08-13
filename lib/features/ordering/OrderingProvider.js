'use strict';

var inherits = require('inherits');

var CommandInterceptor = require('../../command/CommandInterceptor');


/**
 * An abstract provider that allows modelers to implement a custom
 * ordering of diagram elements on the canvas.
 *
 * It makes sure that the order is always preserved during element
 * creation and move operations.
 *
 * In order to use this behavior, inherit from it and override
 * the method {@link OrderingProvider#getOrdering}.
 *
 * @example
 *
 * ```javascript
 * function CustomOrderingProvider(eventBus) {
 *   OrderingProvider.call(this, eventBus);
 *
 *   this.getOrdering = function(element, newParent) {
 *     // always insert elements at the front
 *     // when moving
 *     return {
 *       index: 0,
 *       parent: newParent
 *     };
 *   };
 * }
 * ```
 *
 * @param {EventBus} eventBus
 */
function OrderingProvider(eventBus) {

  CommandInterceptor.call(this, eventBus);


  var self = this;

  this.preExecute([ 'shape.create', 'connection.create' ], function(event) {

    var context = event.context,
        element = context.shape || context.connection,
        parent = context.parent;

    var ordering = self.getOrdering(element, parent);

    if (ordering) {

      if (ordering.parent !== undefined) {
        context.parent = ordering.parent;
      }

      context.parentIndex = ordering.index;
    }
  });

  this.preExecute([ 'shape.move', 'connection.move' ], function(event) {

    var context = event.context,
        element = context.shape || context.connection,
        parent = context.newParent || element.parent;

    var ordering = self.getOrdering(element, parent);

    if (ordering) {

      if (ordering.parent !== undefined) {
        context.newParent = ordering.parent;
      }

      context.newParentIndex = ordering.index;
    }
  });
}

/**
 * Return a custom ordering of the element, both in terms
 * of parent element and index in the new parent.
 *
 * Implementors of this method must return an object with
 * `parent` _and_ `index` in it.
 *
 * @param {djs.model.Base} element
 * @param {djs.model.Shape} newParent
 *
 * @return {Object} ordering descriptor
 */
OrderingProvider.prototype.getOrdering = function(element, newParent) {
  return null;
};

inherits(OrderingProvider, CommandInterceptor);

module.exports = OrderingProvider;