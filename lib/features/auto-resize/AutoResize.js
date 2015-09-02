'use strict';

var inherits = require('inherits');

var is = require('../../util/ModelUtil').is;

var pick = require('lodash/object/pick'),
    assign = require('lodash/object/assign');

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var OFFSET = { top: 60, bottom: 60, left: 100, right: 100 };
var PADDING = { top: 2, bottom: 2, left: 15, right: 15 };

/**
 * An auto resize component that takes care of expanding parent participants
 * and lanes if an element is modeled close to an edge of the parent element.
 */
function AutoResize(eventBus, canvas, modeling){

  CommandInterceptor.call(this, eventBus);

  this.postExecuted([ 'shape.create', 'shape.move' ], function(event) {
    var context = event.context,
        shape = context.shape,
        parent = context.parent || context.newParent;

    expand(shape, parent);
  });

  /**
   * Returns an object which indicates near which bounding edge(s)
   * of a target an element is located.
   *
   * @param  {Shape}  element
   * @param  {Shape}  target
   * @param  {Number} padding
   *
   * @return {Object} {top, bottom, left, right}
   *
   * @example
   *
   * // If an element is near the bottom left corner of a target the return object is:
   * { top: false, bottom: true, left: true, right: false }
   *
   */
  function isInbounds(element, target, padding) {
    return {
      top: element.y < target.y + padding.top && element.y + element.height > target.y,
      bottom: element.y < target.y + target.height &&
        element.y + element.height > target.y + target.height - padding.bottom,
      left: element.x < target.x + padding.left && element.x + element.width > target.x,
      right: element.x < target.x + target.width &&
        element.x + element.width > target.x + target.width - padding.right,
    };
  }

  /**
   * Expand target elements if the moved element is near or on an edge, considering the position
   * of the element edge in relation to the parent's edge plus padding. The amount to expand
   * can be defined for each edge in the OFFSET variables.
   *
   * @param  {Shape} shape
   * @param  {Shape} target
   */
  function expand(shape, target) {

    if (is(shape, 'bpmn:Lane')) {
      return;
    }

    if (shape.labelTarget) {
      return;
    }

    if (!is(target, 'bpmn:Participant') && !is(target, 'bpmn:Lane')) {
      return;
    }

    if (target !== shape.parent) {
      return;
    }

    var inbounds = isInbounds(shape, target, PADDING);

    var newBounds = pick(target, [ 'x', 'y', 'width', 'height' ]);

    if (inbounds.top) {
      var topPosition = shape.y - OFFSET.top;
      assign(newBounds, { y: topPosition, height: target.height + target.y - topPosition });
    }

    if (inbounds.bottom) {
      assign(newBounds, { height: shape.y + shape.height + OFFSET.bottom - target.y });
    }

    if (inbounds.left) {
      var leftPosition = shape.x - OFFSET.left;
      assign(newBounds, { x: leftPosition, width: target.width + target.x - leftPosition });
    }

    if (inbounds.right) {
      assign(newBounds, { width: shape.x + shape.width + OFFSET.right - target.x });
    }

    modeling.resizeShape(target, newBounds);
  }
}

AutoResize.$inject = [ 'eventBus', 'canvas', 'modeling' ];

inherits(AutoResize, CommandInterceptor);

module.exports = AutoResize;
