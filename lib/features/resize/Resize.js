'use strict';

var Snap = require('snapsvg');

var _ = require('lodash'),
    ResizeUtil = require('./Util'),
    Event = require('../../util/Event');


var OUTLINE_OFFSET = 5;
var ANCHOR_LENGTH  = 5;
var MARKER_RESIZING = 'djs-resizing';
var MARKER_RESIZE_NOT_OK = 'resize-not-ok';
var CLASS_RESIZER   = '.djs-resizer';


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
      context.frame.remove();
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
        newBounds,
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
      data: {
        shape: shape,
        context: {
          direction: direction,
          shape: shape
        }
      }
    });
  }


  // resize handles implementation ///////////////////////////////

  function addResize(shape) {

    if (!canResize({ shape: shape })) {
      return;
    }

    function makeDraggable(resizer, direction) {

      resizer.mousedown(function(event) {
        start(event, shape, direction);
      });
    }

    var gfx = elementRegistry.getGraphics(shape);

    // Create four drag indicators on the outline
    var overlayNorthWest = Snap.create('rect', {
      class:  'djs-resizer nort-west',
      cursor: 'nwse-resize',
      width:  ANCHOR_LENGTH + 'px',
      height: ANCHOR_LENGTH + 'px',
      x:      - (ANCHOR_LENGTH + ANCHOR_LENGTH / 2) + 'px',
      y:      - (ANCHOR_LENGTH + ANCHOR_LENGTH / 2) + 'px',
      fill: '#fff',
      strokeWidth: '1px',
      stroke: '#000'
    }).appendTo(gfx);

    makeDraggable(overlayNorthWest, 'nw');

    var overlayNorthEast = Snap.create('rect', {
      class:  'djs-resizer nort-east',
      cursor: 'nesw-resize',
      width:  ANCHOR_LENGTH + 'px',
      height: ANCHOR_LENGTH + 'px',
      x:      shape.width + ANCHOR_LENGTH / 2 + 'px',
      y:      - (ANCHOR_LENGTH + ANCHOR_LENGTH / 2) + 'px',
      fill: '#fff',
      strokeWidth: '1px',
      stroke: '#000'
    }).appendTo(gfx);

    makeDraggable(overlayNorthEast, 'ne');

    var overlaySouthEast = Snap.create('rect', {
      class:  'djs-resizer south-east',
      cursor: 'nwse-resize',
      width:  ANCHOR_LENGTH + 'px',
      height: ANCHOR_LENGTH + 'px',
      x:      shape.width + ANCHOR_LENGTH / 2 + 'px',
      y:      shape.height + ANCHOR_LENGTH / 2 + 'px',
      fill: '#fff',
      strokeWidth: '1px',
      stroke: '#000'
    }).appendTo(gfx);

    makeDraggable(overlaySouthEast, 'se');

    var overlaySouthWest = Snap.create('rect', {
      class:  'djs-resizer south-west',
      cursor: 'nesw-resize',
      width:  ANCHOR_LENGTH + 'px',
      height: ANCHOR_LENGTH + 'px',
      x:      - (ANCHOR_LENGTH + ANCHOR_LENGTH / 2) + 'px',
      y:      shape.height + ANCHOR_LENGTH / 2 + 'px',
      fill: '#fff',
      strokeWidth: '1px',
      stroke: '#000'
    }).appendTo(gfx);

    makeDraggable(overlaySouthWest, 'sw');
  }

  function removeResize(shape) {

    var gfx = elementRegistry.getGraphics(shape);
    var resizers = gfx.selectAll(CLASS_RESIZER);

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