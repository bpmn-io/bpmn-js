'use strict';


var Snap = require('snapsvg');

var _ = require('lodash'),
    $ = require('jquery');

// var MARKER_RESIZEABLE = 'resizeable';
var OUTLINE_OFFSET = 5;
var MARKER_LENGTH  = 5;


/**
 * Add visual indicator to shapes on selection
 * and triggers Resize.resizeShape
 * delta = drag(start) - drag(end)
 */
function ResizeVisuals(eventBus, canvas, overlays, styles, elementRegistry, resize, selection) {

  this._dragContext = null;

  function addResizeMarkers(element) {

    // var OUTLINE_STYLE = styles.cls('djs-outline', [ 'fill' ]);

    var gfx = elementRegistry.getGraphicsByElement(element.id);

    var drag = function drag(gfx, direction) {

      var dragStart = function dragStart(x, y, event) {

        this._dragContext = {
          start: {
            x: x,
            y: y
          }
        };
      };

      var dragEnd = function dragEnd(event) {

        var start = this._dragContext.start;
        var end   = event;

        var x = start.x - end.x;
        var y = start.y - end.y;

        resize.resizeShape(element, {
          direction: direction,
          delta: {
            x: x,
            y: y
          }
        });

        selection.select(element);
      };

      var dragMove = function dragMove(dx, dy, x, y, event) {
        // TODO later
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


}

ResizeVisuals.$inject = [ 'eventBus', 'canvas', 'overlays', 'styles', 'elementRegistry', 'resize', 'selection' ];

module.exports = ResizeVisuals;
