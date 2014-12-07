'use strict';

var Snap = require('snapsvg');

var _ = require('lodash'),
    ResizeUtil = require('./Util'),
    EventUtil = require('../../util/Event');


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
function Resize(eventBus, elementRegistry, rules, modeling, canvas, selection) {

  function canResize(context) {
    var ctx = _.pick(context, [ 'newBounds', 'shape', 'delta', 'direction' ]);
    return rules.allowed('shape.resize', ctx);
  }

  /**
   * A helper that realizes the resize visuals
   */
  var visuals = {
    create: function(e) {
      var container = canvas.getDefaultLayer(),
          shape = e.shape,
          frame;

      frame = e.frame = Snap.create('rect', {
        class: 'djs-resize-overlay',
        width:  shape.width + 10,
        height: shape.height + 10,
        x: shape.x -5,
        y: shape.y -5
      });

      frame.appendTo(container);
    },

    update: function(e) {
      var frame = e.frame,
          bounds = e.newBounds;

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

      frame[e.canExecute ? 'removeClass' : 'addClass'](MARKER_RESIZE_NOT_OK);
    },

    remove: function(e) {
      e.frame.remove();
    }
  };

  var self = this,
      resizeContext; // active resize operation


  // API

  function start(shape, direction) {
    // add resizable indicator
    canvas.addMarker(shape, MARKER_RESIZING);

    // setup resize
    self._resizeContext = resizeContext = {
      shape: shape,
      direction: direction
    };

    visuals.create(resizeContext);
  }

  function update(delta) {

    if (!resizeContext) {
      return;
    }

    var shape = resizeContext.shape,
        direction = resizeContext.direction,
        newBounds,
        canExecute;

    resizeContext.delta = delta;

    newBounds = resizeContext.newBounds = ResizeUtil.resizeBounds(shape, direction, delta);

    // update + cache executable state
    canExecute = resizeContext.canExecute = canResize(resizeContext);

    // update resize frame visuals
    visuals.update(resizeContext);
  }

  function finish() {

    if (!resizeContext) {
      return;
    }

    var shape = resizeContext.shape;

    // perform the actual resize
    if (resizeContext.canExecute) {
      modeling.resizeShape(shape, resizeContext.newBounds);
    }

    cancel();
  }

  function cancel() {
    if (!resizeContext) {
      return;
    }

    var shape = resizeContext.shape;

    // remove resizable indicator
    canvas.removeMarker(shape, MARKER_RESIZING);

    // select element
    selection.select(shape);

    // remove frame + destroy context
    visuals.remove(resizeContext);

    self._resizeContext = resizeContext = null;
  }

  function addResize(shape) {

    if (!canResize({ shape: shape })) {
      return;
    }

    function makeDraggable(resizer, direction) {

      function dragStart(x, y, event) {
        EventUtil.cancel(event);
        start(shape, direction);
      }

      function dragMove(dx, dy, x, y, event) {
        EventUtil.cancel(event);

        var zoom = canvas.zoom(),
            delta = { x: dx / zoom, y: dy / zoom };

        update(delta);
      }

      function dragEnd(event) {
        EventUtil.cancel(event);
        finish();
      }

      resizer.drag(dragMove, dragStart, dragEnd);
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

  this.start = start;
  this.finish = finish;
  this.update = update;
}

Resize.$inject = [ 'eventBus', 'elementRegistry', 'rules', 'modeling', 'canvas', 'selection' ];

module.exports = Resize;