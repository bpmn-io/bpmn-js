'use strict';

var _ = require('lodash');


function originalEvent(e) {
  return e.srcEvent || e;
}


/**
 * @class
 *
 * A plugin that adds a visible selection UI to shapes and connections
 * by appending the <code>hover</code> and <code>selected</code> classes to them.
 *
 * Makes elements selectable, too.
 *
 * @param {EventBus} events
 * @param {SelectionService} selection
 * @param {ElementRegistry} elementRegistry
 */
function SelectionVisuals(events, selection, elementRegistry) {

  var HOVER_CLS = 'hover',
      SELECTED_CLS = 'selected';

  function addMarker(gfx, cls) {
    if (gfx) {
      gfx.addClass(cls);
    }
  }

  function removeMarker(gfx, cls) {
    if (gfx) {
      gfx.removeClass(cls);
    }
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
    addMarker(event.gfx, HOVER_CLS);
  });

  events.on('shape.out', function(event) {
    removeMarker(event.gfx, HOVER_CLS);
  });

  events.on('selection.changed', function(event) {

    function deselect(s) {
      removeMarker(elementRegistry.getGraphicsByElement(s), SELECTED_CLS);
    }

    function select(s) {
      addMarker(elementRegistry.getGraphicsByElement(s), SELECTED_CLS);
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
  'elementRegistry'
];

module.exports = SelectionVisuals;