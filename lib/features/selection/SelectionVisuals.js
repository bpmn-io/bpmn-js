'use strict';

var _ = require('lodash');


function originalEvent(e) {
  return e.srcEvent || e;
}


var MARKER_HOVER = 'hover',
    MARKER_SELECTED = 'selected';


/**
 * A plugin that adds a visible selection UI to shapes and connections
 * by appending the <code>hover</code> and <code>selected</code> classes to them.
 *
 * @class
 *
 * Makes elements selectable, too.
 *
 * @param {EventBus} events
 * @param {SelectionService} selection
 * @param {Canvas} canvas
 */
function SelectionVisuals(events, selection, canvas) {

  function addMarker(e, cls) {
    canvas.addMarker(e, cls);
  }

  function removeMarker(e, cls) {
    canvas.removeMarker(e, cls);
  }

  /**
   * Wire click on shape to select the shape
   *
   * @param  {Object} event the fired event
   */
  events.on('shape.click', function(event) {
    var add = originalEvent(event).shiftKey;
    selection.select(event.element, add);
  });

  events.on('shape.hover', function(event) {
    addMarker(event.element, MARKER_HOVER);
  });

  events.on('shape.out', function(event) {
    removeMarker(event.element, MARKER_HOVER);
  });

  events.on('selection.changed', function(event) {

    function deselect(s) {
      removeMarker(s, MARKER_SELECTED);
    }

    function select(s) {
      addMarker(s, MARKER_SELECTED);
    }

    var oldSelection = event.oldSelection,
        newSelection = event.newSelection;

    _.forEach(oldSelection, function(e) {
      if (newSelection.indexOf(e) === -1) {
        deselect(e);
      }
    });

    _.forEach(newSelection, function(e) {
      if (oldSelection.indexOf(e) === -1) {
        select(e);
      }
    });
  });

  // deselect all selected shapes on canvas click
  events.on('canvas.click', function(event) {
    if (originalEvent(event).srcElement === event.root.paper.node) {
      selection.select(null);
    }
  });
}

SelectionVisuals.$inject = [
  'eventBus',
  'selection',
  'canvas'
];

module.exports = SelectionVisuals;