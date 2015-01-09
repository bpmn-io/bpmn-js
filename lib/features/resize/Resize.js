'use strict';

var Snap = require('snapsvg');

var _ = require('lodash'),
    ResizeUtil = require('./Util'),
    Dom = require('../../util/Dom');


var HANDLE_OFFSET = -2,
    HANDLE_SIZE  = 5,
    HANDLE_HIT_SIZE = 20;

var MARKER_RESIZING = 'djs-resizing',
    MARKER_RESIZE_NOT_OK = 'resize-not-ok',
    CLS_RESIZER   = 'djs-resizer';


/**
 * Implements resize on shapes by
 *
 *   * adding resize handles,
 *   * creating a visual during resize
 *   * checking resize rules
 *   * committing a change once finished
 *
 */
function Resize(eventBus, elementRegistry, rules, modeling, canvas, selection, dragging) {

  function canResize(context) {
    var ctx = _.pick(context, [ 'newBounds', 'shape', 'delta', 'direction' ]);
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


  eventBus.on('resize.start', function(event) {

    var context = event.context,
        shape = context.shape;

    // add resizable indicator
    canvas.addMarker(shape, MARKER_RESIZING);

    visuals.create(context);
  });

  eventBus.on('resize.move', function(event) {

    var context = event.context,
        shape = context.shape,
        direction = context.direction,
        delta;

    delta = {
      x: event.dx,
      y: event.dy
    };

    context.delta = delta;

    context.newBounds = ResizeUtil.resizeBounds(shape, direction, delta);

    // update + cache executable state
    context.canExecute = canResize(context);

    // update resize frame visuals
    visuals.update(context);
  });

  eventBus.on('resize.end', function(event) {
    var context = event.context,
        shape = context.shape;

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


  function start(event, shape, direction) {

    dragging.activate(event, 'resize', {
      autoActivate: true,
      data: {
        shape: shape,
        context: {
          direction: direction,
          shape: shape
        }
      }
    });
  }

  function makeDraggable(element, gfx, direction) {

    function listener(event) {
      // only start on left-click (button=0)
      if (!event.button) {
        start(event, element, direction);
      }
    }

    Dom.on(gfx.node, 'mousedown', listener);
    Dom.on(gfx.node, 'touchstart', listener);
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

    _.forEach(resizers, function(resizer){
      resizer.remove();
    });
  }

  eventBus.on('selection.changed', function(e) {

    var oldSelection = e.oldSelection,
        newSelection = e.newSelection;

    // remove old selection markers
    _.forEach(oldSelection, removeResize);

    // add new selection markers ONLY if single selection
    if (newSelection.length === 1) {
      _.forEach(newSelection, addResize);
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

  this.start = start;
}

Resize.$inject = [ 'eventBus', 'elementRegistry', 'rules', 'modeling', 'canvas', 'selection', 'dragging' ];

module.exports = Resize;
