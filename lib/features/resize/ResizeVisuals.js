'use strict';


var Snap = require('snapsvg');

var _ = require('lodash'),
    $ = require('jquery'),
    ResizeUtil = require('./ResizeUtil');

// var MARKER_RESIZEABLE = 'resizeable';
var OUTLINE_OFFSET = 5;
var ANCHOR_LENGTH  = 5;
var MARKER_RESIZING = 'djs-resizing';
var CLASS_RESIZER   = '.djs-resizer';


/**
 * Add visual indicator to shapes on selection
 * and triggers Resize.resizeShape
 * delta = drag(start) - drag(end)
 */
function ResizeVisuals(eventBus, canvas, elementRegistry, resize, selection, styles) {

  this._dragContext = null;

  function addResizeMarkers(element) {

    var isResizable = resize.isResizable(element);
    if (!isResizable) {
      return;
    }

    var minSize = resize.getMinimumSize(element);

    var gfx = elementRegistry.getGraphicsByElement(element.id);

    var drag = function drag(gfx, direction) {

      var dragStart = function dragStart(x, y, event) {

        var gfx = elementRegistry.getGraphicsByElement(element);
        var anchors = gfx.selectAll(CLASS_RESIZER);

        this._dragContext = {
          start: {
            x: x,
            y: y
          },
          last: {
            dx: 0,
            dy: 0
          }
        };

        canvas.addMarker(element, MARKER_RESIZING);

        // stop propagation
        (event.originalEvent || event).stopPropagation();

        // create resizeFrame gfx
        var resizeFrame = Snap.create('rect', {

          fill: '#fff',
          strokeWidth: '1px',
          stroke: '#D11975'
        });

        resizeFrame.attr(styles.cls('djs-resize-overlay', [], {
          width:  element.width + 10,
          height: element.height + 10,
          x:      -5,
          y:      -5,
          strokeDasharray: '5, 5, 1, 5',
          strokeOpacity:   'none'
        }));

        resizeFrame.appendTo(gfx);
        this._dragContext.resizeFrame = resizeFrame;
      };

      var dragEnd = function dragEnd(event) {

        var start = this._dragContext.start;
        var end   = event;

        var gfx = elementRegistry.getGraphicsByElement(element);
        var anchors = gfx.selectAll(CLASS_RESIZER);

        var x = start.x - end.x;
        var y = start.y - end.y;

        selection.select(element);

        canvas.removeMarker(element, MARKER_RESIZING);

        // remove resizeFrame
        this._dragContext.resizeFrame.remove();
        this._dragContext = null;

        //resize shape
        resize.resizeShape(element, {
          direction: direction,
          delta: {
            x: x,
            y: y
          }
        });
        (event.originalEvent || event).stopPropagation();
      };

      var dragMove = function dragMove(dx, dy, x, y, event) {

        var last  = this._dragContext.last,
            resizeFrame = this._dragContext.resizeFrame,
            width,
            height;

        var _dx = last.dx - dx;
        var _dy = last.dy - dy;

        var newBBox = ResizeUtil.createResizeBBox(direction, resizeFrame.getBBox(), {dx: _dx, dy: _dy}, minSize);

        resizeFrame.attr({
          width: newBBox.width,
          height: newBBox.height,
          x: newBBox.x,
          y: newBBox.y
        });

        // save diff for next move event
        if (!newBBox.correctedX) {
          last.dx = dx;
        }
        if (!newBBox.correctedY) {
          last.dy = dy;
        }
        (event.originalEvent || event).stopPropagation();
      };

      gfx.drag(dragMove, dragStart, dragEnd, this, this, this);
    };

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
    drag(overlayNorthWest, 'nw');

    var overlayNorthEast = Snap.create('rect', {
      class:  'djs-resizer nort-east',
      cursor: 'nesw-resize',
      width:  ANCHOR_LENGTH + 'px',
      height: ANCHOR_LENGTH + 'px',
      x:      element.width + ANCHOR_LENGTH / 2 + 'px',
      y:      - (ANCHOR_LENGTH + ANCHOR_LENGTH / 2) + 'px',
      fill: '#fff',
      strokeWidth: '1px',
      stroke: '#000'
    }).appendTo(gfx);
    drag(overlayNorthEast, 'ne');

    var overlaySouthEast = Snap.create('rect', {
      class:  'djs-resizer south-east',
      cursor: 'nwse-resize',
      width:  ANCHOR_LENGTH + 'px',
      height: ANCHOR_LENGTH + 'px',
      x:      element.width + ANCHOR_LENGTH / 2 + 'px',
      y:      element.height + ANCHOR_LENGTH / 2 + 'px',
      fill: '#fff',
      strokeWidth: '1px',
      stroke: '#000'
    }).appendTo(gfx);
    drag(overlaySouthEast, 'se');

    var overlaySouthWest = Snap.create('rect', {
      class:  'djs-resizer south-west',
      cursor: 'nesw-resize',
      width:  ANCHOR_LENGTH + 'px',
      height: ANCHOR_LENGTH + 'px',
      x:      - (ANCHOR_LENGTH + ANCHOR_LENGTH / 2) + 'px',
      y:      element.height + ANCHOR_LENGTH / 2 + 'px',
      fill: '#fff',
      strokeWidth: '1px',
      stroke: '#000'
    }).appendTo(gfx);
    drag(overlaySouthWest, 'sw');

  }

  function removeResizeMarker(e) {

    var gfx = elementRegistry.getGraphicsByElement(e.id);
    var resizers = gfx.selectAll(CLASS_RESIZER);

    _.forEach(resizers, function(resizer){
      resizer.remove();
    });
  }

  eventBus.on('selection.changed', function(e) {

    var oldSelection = e.oldSelection,
        newSelection = e.newSelection;

    // Remove marker from all previous selected elements
    _.forEach(oldSelection, function(element) {
      removeResizeMarker(element);
    });

    // Add Resizeable marker if only one item is selected
    if (newSelection.length === 1) {
      _.forEach(newSelection, function(element) {
        addResizeMarkers(element);
      });
    }
  });

  eventBus.on('commandStack.shape.resize.reverted', function(e) {

    var shape = e.context.shape;

    removeResizeMarker(shape);
    addResizeMarkers(shape);
  });

  eventBus.on('shape.resized', function(e) {
    var shape = e.shape;

    removeResizeMarker(shape);
    selection.select(shape);
  });


}

ResizeVisuals.$inject = [ 'eventBus', 'canvas', 'elementRegistry', 'resize', 'selection', 'styles' ];

module.exports = ResizeVisuals;
