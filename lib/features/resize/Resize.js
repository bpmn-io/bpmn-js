'use strict';

var forEach = require('lodash/collection/forEach'),
    filter = require('lodash/collection/filter'),
    pick = require('lodash/object/pick'),
    assign = require('lodash/object/assign');

var ResizeUtil = require('./ResizeUtil'),
    domEvent = require('min-dom/lib/event'),
    Elements = require('../../util/Elements');

var isPrimaryButton = require('../../util/Mouse').isPrimaryButton;

var round = Math.round;

var Snap = require('../../../vendor/snapsvg');

var HANDLE_OFFSET = -2,
    HANDLE_SIZE  = 5,
    HANDLE_HIT_SIZE = 20;

var MARKER_RESIZING = 'djs-resizing',
    MARKER_RESIZE_NOT_OK = 'resize-not-ok',
    CLS_RESIZER   = 'djs-resizer';


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
function Resize(eventBus, elementRegistry, rules, modeling, canvas, selection, dragging) {

  function canResize(context) {
    var ctx = pick(context, [ 'newBounds', 'shape', 'delta', 'direction' ]);
    return rules.allowed('shape.resize', ctx);
  }


  // resizing implementation //////////////////////////////////

  /**
   * A helper that realizes the resize visuals
   */
  var visuals = {
    create: function(context) {
      var container = canvas.getDefaultLayer(),
          shape = context.shape,
          frame;

      frame = context.frame = Snap.create('rect', {
        class: 'djs-resize-overlay',
        width:  shape.width + 10,
        height: shape.height + 10,
        x: shape.x -5,
        y: shape.y -5
      });

      frame.appendTo(container);
    },

    update: function(context) {
      var frame = context.frame,
          bounds = context.newBounds;

      if (bounds.width > 5) {
        frame.attr({
          x: bounds.x,
          width: bounds.width
        });
      }

      if (bounds.height > 5) {
        frame.attr({
          y: bounds.y,
          height: bounds.height
        });
      }

      frame[context.canExecute ? 'removeClass' : 'addClass'](MARKER_RESIZE_NOT_OK);
    },

    remove: function(context) {
      if (context.frame) {
        context.frame.remove();
      }
    }
  };

  /**
   * is the given element part of the
   * resize targets min boundary box
   *
   * @param {djs.model.Base} element
   */
  function isBBoxChild(element) {
    // exclude connections
    if (element.waypoints) {
      return false;
    }

    // labels
    if (element.type === 'label') {
      return false;
    }

    return true;
  }

  function addPadding(bbox, padding) {

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
  }

  function computeChildrenBBox(shape, padding) {

    // grab all the children that are part of the
    // parents children box
    var children = filter(shape.children, isBBoxChild);

    if (children.length) {
      return addPadding(Elements.getBBox(children), padding);
    }
  }

  function computeMinResizeBox(context) {

    var shape = context.shape,
        direction = context.direction,
        childrenBounds;

    // get children bounds
    childrenBounds = computeChildrenBBox(shape, context.childrenBoxPadding);

    // get correct minimum bounds from given resize direction
    // basically ensures that the minBounds is max(childrenBounds, minDimensions)
    return ResizeUtil.getMinResizeBounds(direction, shape, context.minDimensions || {
      width: DEFAULT_MIN_WIDTH,
      height: DEFAULT_MIN_WIDTH
    }, childrenBounds);
  }

  eventBus.on('resize.start', function(event) {

    var context = event.context,
        shape = context.shape,
        minBounds = context.minBounds;

    if (minBounds === undefined) {
      context.minBounds = computeMinResizeBox(context);
    }

    // add resizable indicator
    canvas.addMarker(shape, MARKER_RESIZING);

    visuals.create(context);
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
    context.canExecute = canResize(context);

    // update resize frame visuals
    visuals.update(context);
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

  eventBus.on('resize.cleanup', function(event) {

    var context = event.context,
        shape = context.shape;

    // remove resizable indicator
    canvas.removeMarker(shape, MARKER_RESIZING);

    // remove frame + destroy context
    visuals.remove(context);
  });


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
  function activate(event, shape, contextOrDirection) {

    var context,
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
  }

  function makeDraggable(element, gfx, direction) {

    function listener(event) {
      // only trigger on left mouse button
      if (isPrimaryButton(event)) {
        activate(event, element, direction);
      }
    }

    domEvent.bind(gfx.node, 'mousedown', listener);
    domEvent.bind(gfx.node, 'touchstart', listener);
  }

  function __createResizer(gfx, x, y, rotation, direction) {

    var group = gfx.group().addClass(CLS_RESIZER).addClass(CLS_RESIZER + '-' + direction);

    var origin = -HANDLE_SIZE + HANDLE_OFFSET;

    // Create four drag indicators on the outline
    group.rect(origin, origin, HANDLE_SIZE, HANDLE_SIZE).addClass(CLS_RESIZER + '-visual');
    group.rect(origin, origin, HANDLE_HIT_SIZE, HANDLE_HIT_SIZE).addClass(CLS_RESIZER + '-hit');

    var matrix = new Snap.Matrix().translate(x, y).rotate(rotation, 0, 0);
    group.transform(matrix);

    return group;
  }

  function createResizer(element, gfx, direction) {

    var resizer;

    if (direction === 'nw') {
      resizer = __createResizer(gfx, 0, 0, 0, direction);
    } else if (direction === 'ne') {
      resizer = __createResizer(gfx, element.width, 0, 90, direction);
    } else if (direction === 'se') {
      resizer = __createResizer(gfx, element.width, element.height, 180, direction);
    } else {
      resizer = __createResizer(gfx, 0, element.height, 270, direction);
    }

    makeDraggable(element, resizer, direction);
  }

  // resize handles implementation ///////////////////////////////

  function addResize(shape) {

    if (!canResize({ shape: shape })) {
      return;
    }

    var gfx = elementRegistry.getGraphics(shape);

    createResizer(shape, gfx, 'nw');
    createResizer(shape, gfx, 'ne');
    createResizer(shape, gfx, 'se');
    createResizer(shape, gfx, 'sw');
  }

  function removeResize(shape) {

    var gfx = elementRegistry.getGraphics(shape);
    var resizers = gfx.selectAll('.' + CLS_RESIZER);

    forEach(resizers, function(resizer){
      resizer.remove();
    });
  }

  eventBus.on('selection.changed', function(e) {

    var oldSelection = e.oldSelection,
        newSelection = e.newSelection;

    // remove old selection markers
    forEach(oldSelection, removeResize);

    // add new selection markers ONLY if single selection
    if (newSelection.length === 1) {
      forEach(newSelection, addResize);
    }
  });

  eventBus.on('shape.changed', function(e) {
    var shape = e.element;

    removeResize(shape);

    if (selection.isSelected(shape)) {
      addResize(shape);
    }
  });


  // API

  this.activate = activate;
}

Resize.$inject = [ 'eventBus', 'elementRegistry', 'rules', 'modeling', 'canvas', 'selection', 'dragging' ];

module.exports = Resize;
