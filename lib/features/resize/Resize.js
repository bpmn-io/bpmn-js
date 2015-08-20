'use strict';

var filter = require('lodash/collection/filter'),
    pick = require('lodash/object/pick'),
    assign = require('lodash/object/assign');

var ResizeUtil = require('./ResizeUtil'),
    Elements = require('../../util/Elements');


var round = Math.round;

var DEFAULT_MIN_WIDTH = 10;

var DEFAULT_CHILD_BOX_PADDING = 20;


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
        minBounds = context.minBounds;

    if (minBounds === undefined) {
      context.minBounds = self.computeMinResizeBox(context);
    }
  });

  eventBus.on('resize.move', function(event) {

    var context = event.context,
        shape = context.shape,
        direction = context.direction,
        minBounds = context.minBounds,
        delta;

    delta = {
      x: event.dx,
      y: event.dy
    };

    context.delta = delta;

    context.newBounds = ResizeUtil.resizeBounds(shape, direction, delta);

    if (minBounds) {
      context.newBounds = ResizeUtil.ensureMinBounds(context.newBounds, minBounds);
    }

    // update + cache executable state
    context.canExecute = self.canResize(context);
  });

  eventBus.on('resize.end', function(event) {
    var context = event.context,
        shape = context.shape;

    var newBounds = context.newBounds;


    // ensure we have actual pixel values for new bounds
    // (important when zoom level was > 1 during move)
    newBounds.x = round(newBounds.x);
    newBounds.y = round(newBounds.y);
    newBounds.width = round(newBounds.width);
    newBounds.height = round(newBounds.height);

    // perform the actual resize
    if (context.canExecute) {
      modeling.resizeShape(shape, context.newBounds);
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

  dragging.activate(event, 'resize', {
    autoActivate: true,
    cursor: 'resize-' + (/nw|se/.test(direction) ? 'nwse' : 'nesw'),
    data: {
      shape: shape,
      context: context
    }
  });
};

/**
 * is the given element part of the
 * resize targets min boundary box
 *
 * @param {djs.model.Base} element
 */
Resize.prototype.isBBoxChild = function(element) {
  // exclude connections
  if (element.waypoints) {
    return false;
  }

  // labels
  if (element.type === 'label') {
    return false;
  }

  return true;
};

Resize.prototype.computeMinResizeBox = function(context) {
  var shape = context.shape,
      direction = context.direction,
      childrenBounds;

  // get children bounds
  childrenBounds = this.computeChildrenBBox(shape, context.childrenBoxPadding);

  // get correct minimum bounds from given resize direction
  // basically ensures that the minBounds is max(childrenBounds, minDimensions)
  return ResizeUtil.getMinResizeBounds(direction, shape, context.minDimensions || {
    width: DEFAULT_MIN_WIDTH,
    height: DEFAULT_MIN_WIDTH
  }, childrenBounds);
};

Resize.prototype.computeChildrenBBox = function(shape, padding) {

  // grab all the children that are part of the
  // parents children box
  var children = filter(shape.children, this.isBBoxChild, this);

  if (children.length) {
    return this.addPadding(Elements.getBBox(children), padding);
  }
};

Resize.prototype.addPadding = function(bbox, padding) {
  var left, right, top, bottom;

  if (typeof padding === 'object') {
    left = padding.left || DEFAULT_CHILD_BOX_PADDING;
    right = padding.right || DEFAULT_CHILD_BOX_PADDING;
    top = padding.top || DEFAULT_CHILD_BOX_PADDING;
    bottom = padding.bottom || DEFAULT_CHILD_BOX_PADDING;
  } else {
    left = right = top = bottom = padding || DEFAULT_CHILD_BOX_PADDING;
  }

  return {
    x: bbox.x - left,
    y: bbox.y - top,
    width: bbox.width + left + right,
    height: bbox.height + top + bottom
  };
};

Resize.$inject = [ 'eventBus', 'rules', 'modeling', 'dragging' ];

module.exports = Resize;
