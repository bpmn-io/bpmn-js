'use strict';


var Snap = require('snapsvg');

var _ = require('lodash'),
    $ = require('jquery'),
    ResizeUtil = require('./ResizeUtil');

// var MARKER_RESIZEABLE = 'resizeable';
var OUTLINE_OFFSET = 5;
var MARKER_LENGTH  = 5;
var MARKER_RESIZE = 'djs-resize';


/**
 * Add visual indicator to shapes on selection
 * and triggers Resize.resizeShape
 * delta = drag(start) - drag(end)
 */
function ResizeVisuals(eventBus, canvas, elementRegistry, resize, selection, styles) {

  this._dragContext = null;

  function addResizeMarkers(element) {

    var gfx = elementRegistry.getGraphicsByElement(element.id);

    var drag = function drag(gfx, direction) {

      var dragStart = function dragStart(x, y, event) {

        var gfx = elementRegistry.getGraphicsByElement(element);
        var outline = gfx.select('.djs-outline');
        var anchors = gfx.selectAll('.resize');

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

        // prepare gfx
        outline.attr({
          visibility: 'hidden'
        });

        _.forEach(anchors,function(anchor) {
          anchor.attr({
            visibility: 'hidden'
          });
        });
        canvas.addMarker(element, MARKER_RESIZE);

        // stop propagation
        (event.originalEvent || event).stopPropagation();

        // clone gfx
        var clone = Snap.create('rect', {

          fill: '#fff',
          strokeWidth: '1px',

          stroke: '#D11975'
        });

        clone.attr(styles.cls('djs-resize-overlay', [], {
          width:  element.width + 10,
          height: element.height + 10,
          x:      -5,
          y:      -5,
          strokeDasharray: '5, 5, 1, 5',
          strokeOpacity:   'none'
        }));
        clone.appendTo(gfx);
        this._dragContext.clone = clone;
      };

      var dragEnd = function dragEnd(event) {

        var start = this._dragContext.start;
        var end   = event;

        var gfx = elementRegistry.getGraphicsByElement(element);
        var outline = gfx.select('.djs-outline');
        var anchors = gfx.selectAll('.resize');

        var x = start.x - end.x;
        var y = start.y - end.y;

        selection.select(element);

        outline.attr({
          visibility: 'visible'
        });

        _.forEach(anchors,function(anchor) {
          anchor.attr({
            visibility: 'visible'
          });
        });
        canvas.removeMarker(element, MARKER_RESIZE);

        // remove clone
        this._dragContext.clone.remove();
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
            clone = this._dragContext.clone,
            width,
            height;

        var _dx = last.dx - dx;
        var _dy = last.dy - dy;

        var newBBox = ResizeUtil.createResizeBBox(direction, clone.getBBox(), {dx: _dx, dy: _dy});

          clone.attr({
            width: newBBox.width,
            height: newBBox.height,
            x: newBBox.x,
            y: newBBox.y
          });

        // save diff for next move event
        last.dx = dx;
        last.dy = dy;
        (event.originalEvent || event).stopPropagation();
      };

      gfx.drag(dragMove, dragStart, dragEnd, this, this, this);
    };

    // Create four drag indicators on the outline
    var overlayNorthWest = Snap.create('rect', {
      class:  'resize nort-west',
      cursor: 'nwse-resize',
      width:  MARKER_LENGTH + 'px',
      height: MARKER_LENGTH + 'px',
      x:      - (MARKER_LENGTH + MARKER_LENGTH / 2) + 'px',
      y:      - (MARKER_LENGTH + MARKER_LENGTH / 2) + 'px',
      fill: '#fff',
      strokeWidth: '1px',
      stroke: '#000'
    }).appendTo(gfx);
    drag(overlayNorthWest, 'nw');

    var overlayNorthEast = Snap.create('rect', {
      class:  'resize nort-east',
      cursor: 'nesw-resize',
      width:  MARKER_LENGTH + 'px',
      height: MARKER_LENGTH + 'px',
      x:      element.width + MARKER_LENGTH / 2 + 'px',
      y:      - (MARKER_LENGTH + MARKER_LENGTH / 2) + 'px',
      fill: '#fff',
      strokeWidth: '1px',
      stroke: '#000'
    }).appendTo(gfx);
    drag(overlayNorthEast, 'ne');

    var overlaySouthEast = Snap.create('rect', {
      class:  'resize south-east',
      cursor: 'nwse-resize',
      width:  MARKER_LENGTH + 'px',
      height: MARKER_LENGTH + 'px',
      x:      element.width + MARKER_LENGTH / 2 + 'px',
      y:      element.height + MARKER_LENGTH / 2 + 'px',
      fill: '#fff',
      strokeWidth: '1px',
      stroke: '#000'
    }).appendTo(gfx);
    drag(overlaySouthEast, 'se');

    var overlaySouthWest = Snap.create('rect', {
      class:  'resize south-west',
      cursor: 'nesw-resize',
      width:  MARKER_LENGTH + 'px',
      height: MARKER_LENGTH + 'px',
      x:      - (MARKER_LENGTH + MARKER_LENGTH / 2) + 'px',
      y:      element.height + MARKER_LENGTH / 2 + 'px',
      fill: '#fff',
      strokeWidth: '1px',
      stroke: '#000'
    }).appendTo(gfx);
    drag(overlaySouthWest, 'sw');

  }

  function removeResizeMarker(e) {

    var gfx = elementRegistry.getGraphicsByElement(e.id);
    var resizers = gfx.selectAll('.resize');

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
