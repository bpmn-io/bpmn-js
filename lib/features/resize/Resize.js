'use strict';

var pick = require('lodash/object/pick'),
    assign = require('lodash/object/assign');

var ResizeUtil = require('./ResizeUtil');

var asTRBL = require('../../layout/LayoutUtil').asTRBL,
    roundBounds = require('../../layout/LayoutUtil').roundBounds;

var DEFAULT_MIN_WIDTH = 10;


/**
 * A component that provides resizing of shapes on the canvas.
 *
 * The following components are part of shape resize:
 *
 *  * adding resize handles,
 *  * creating a visual during resize
 *  * checking resize rules
 *  * committing a change once finished
 *
 *
 * ## Customizing
 *
 * It's possible to customize the resizing behaviour by intercepting 'resize.start'
 * and providing the following parameters through the 'context':
 *
 *   * minDimensions ({ width, height }): minimum shape dimensions
 *
 *   * childrenBoxPadding ({ left, top, bottom, right } || number):
 *     gap between the minimum bounding box and the container
 *
 * f.ex:
 *
 * ```javascript
 * eventBus.on('resize.start', 1500, function(event) {
 *   var context = event.context,
 *
 *  context.minDimensions = { width: 140, height: 120 };
 *
 *  // Passing general padding
 *  context.childrenBoxPadding = 30;
 *
 *  // Passing padding to a specific side
 *  context.childrenBoxPadding.left = 20;
 * });
 * ```
 */
function Resize(eventBus, rules, modeling, dragging) {

  this._dragging = dragging;
  this._rules = rules;

  var self = this;

  eventBus.on('resize.start', function(event) {

    var context = event.context,
        resizeConstraints = context.resizeConstraints,
        // evaluate minBounds for backwards compatibility
        minBounds = context.minBounds;

    if (resizeConstraints === undefined) {

      if (minBounds === undefined) {
        minBounds = self.computeMinResizeBox(context);
      }

      context.resizeConstraints = {
        min: asTRBL(minBounds)
      };
    }
  });

  eventBus.on('resize.move', function(event) {

    var context = event.context,
        shape = context.shape,
        direction = context.direction,
        resizeConstraints = context.resizeConstraints,
        delta,
        newBounds;

    delta = {
      x: event.dx,
      y: event.dy
    };

    context.delta = delta;

    newBounds = ResizeUtil.resizeBounds(shape, direction, delta);

    // ensure constraints during resize
    context.newBounds = ResizeUtil.ensureConstraints(newBounds, resizeConstraints);

    // update + cache executable state
    context.canExecute = self.canResize(context);
  });

  eventBus.on('resize.end', function(event) {
    var context = event.context,
        shape = context.shape,
        canExecute = context.canExecute,
        newBounds = context.newBounds;

    if (canExecute) {
      // ensure we have actual pixel values for new bounds
      // (important when zoom level was > 1 during move)
      newBounds = roundBounds(newBounds);

      // perform the actual resize
      modeling.resizeShape(shape, newBounds);
    }
  });
}


Resize.prototype.canResize = function(context) {
  var rules = this._rules;

  var ctx = pick(context, [ 'newBounds', 'shape', 'delta', 'direction' ]);

  return rules.allowed('shape.resize', ctx);
};

/**
 * Activate a resize operation
 *
 * You may specify additional contextual information and must specify a
 * resize direction during activation of the resize event.
 *
 * @param {MouseEvent} event
 * @param {djs.model.Shape} shape
 * @param {Object|String} contextOrDirection
 */
Resize.prototype.activate = function(event, shape, contextOrDirection) {
  var dragging = this._dragging,
      context,
      direction;

  if (typeof contextOrDirection === 'string') {
    contextOrDirection = {
      direction: contextOrDirection
    };
  }

  context = assign({ shape: shape }, contextOrDirection);

  direction = context.direction;

  if (!direction) {
    throw new Error('must provide a direction (nw|se|ne|sw)');
  }

  dragging.init(event, 'resize', {
    autoActivate: true,
    cursor: 'resize-' + (/nw|se/.test(direction) ? 'nwse' : 'nesw'),
    data: {
      shape: shape,
      context: context
    }
  });
};

Resize.prototype.computeMinResizeBox = function(context) {
  var shape = context.shape,
      direction = context.direction,
      minDimensions,
      childrenBounds;

  minDimensions = context.minDimensions || {
    width: DEFAULT_MIN_WIDTH,
    height: DEFAULT_MIN_WIDTH
  };

  // get children bounds
  childrenBounds = ResizeUtil.computeChildrenBBox(shape, context.childrenBoxPadding);

  // get correct minimum bounds from given resize direction
  // basically ensures that the minBounds is max(childrenBounds, minDimensions)
  return ResizeUtil.getMinResizeBounds(direction, shape, minDimensions, childrenBounds);
};


Resize.$inject = [ 'eventBus', 'rules', 'modeling', 'dragging' ];

module.exports = Resize;
