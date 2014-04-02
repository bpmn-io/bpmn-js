require('../../core/EventBus');
require('../../core/ElementRegistry');


require('../InteractionEvents');
require('../Outline');

require('./Service');

var Diagram = require('../../Diagram'),
    _ = require('lodash');

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
 * @param {ElementRegistry} shapes
 */
function SelectionVisuals(events, selection, shapes) {

  var HOVER_CLS = 'hover',
      SELECTED_CLS = 'selected';

  function addMarker(gfx, cls) {
    gfx.addClass(cls);
  }

  function removeMarker(gfx, cls) {
    gfx.removeClass(cls);
  }
  
  /**
   * Wire click on shape to select the shape
   * 
   * @param  {Object} event the fired event
   */
  events.on('shape.click', function(event) {
    var add = event.shiftKey;
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
      addMarker(shapes.getGraphicsByShape(s), SELECTED_CLS);
    }

    function select(s) {
      removeMarker(shapes.getGraphicsByShape(s), SELECTED_CLS);
    }

    var oldSelection = event.oldSelection,
        newSelection = event.newSelection;

    _.forEach(oldSelection, function(e) {
      if (newSelection.indexOf(e) === -1) {
        select(e);
      }
    });

    _.forEach(newSelection, function(e) {
      if (oldSelection.indexOf(e) === -1) {
        deselect(e);
      }
    });
  });

  // intercept direct canvas clicks to deselect all
  // selected shapes
  events.on('canvas.init', function(event) {
    var paper = event.paper;

    paper.click(function(event) {
      if (event.srcElement === paper.node) {
        selection.select(null);
      }
    });
  });
}

Diagram.plugin('selectionVisuals', [
  'eventBus',
  'selection',
  'elementRegistry',
  'interactionEvents',
  'outline', SelectionVisuals ]);

module.exports = SelectionVisuals;