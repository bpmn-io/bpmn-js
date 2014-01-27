require('../core/Events');
require('./Selection');
require('./Shapes');
require('./Interactivity');

var Diagram = require('../Diagram'),
    _ = require('../util/underscore');


/**
 * @class
 *
 * A plugin that makes shapes selectable.
 * 
 * @param {Events} events the event bus
 * @param {Selection} selection the selection service
 * @param {Shapes} shapes the shapes service
 */
function ShapeSelection(events, selection, shapes) {

  function getGraphicsSelectionBox(graphics) {
    var parent = graphics.parent();
    return parent.select('.selection-box');
  }

  function getSelectionBox(shape) {
    var graphics = shapes.getGraphicsByShape(shape);
    return getGraphicsSelectionBox(graphics);
  }

  function select(shape) {
    var selectionBox = getSelectionBox(shape);
    if (selectionBox) {
      selectionBox.addClass('selected');
    }

    // TODO: move group to top
  }

  function deselect(shape) {
    var selectionBox = getSelectionBox(shape);
    if (selectionBox) {
      selectionBox.removeClass('selected');
    }
  }

  function hover(shape) {
    var selectionBox = getSelectionBox(shape);
    if (selectionBox) {
      selectionBox.addClass('hover');
    }
  }

  function out(shape) {
    var selectionBox = getSelectionBox(shape);
    if (selectionBox) {
      selectionBox.removeClass('hover');
    }
  }

  function updateSelectionBox(graphics, selectionBox) {
    if (!selectionBox) {
      return;
    }

    var bbox = graphics.getBBox(true);

    selectionBox.attr({
      x: bbox.x - 10,
      y: bbox.y - 10,
      width: bbox.width + 20,
      height: bbox.height + 20
    });
  }

  events.on('shape.click', function(event) {
    var add = event.shiftKey;
    selection.select(event.element, add);
  });

  events.on('shape.hover', function(event) {
    hover(event.element);
  });

  events.on('shape.out', function(event) {
    out(event.element);
  });

  events.on('shape.change', function(event) {
    updateSelectionBox(event.gfx, getGraphicsSelectionBox(event.gfx));
  });

  events.on('shape.added', function(event) {
    var shape = event.element,
        graphics = event.gfx,
        group = graphics.parent();

    var bbox = graphics.getBBox(true);

    var selectionBox = graphics.paper.rect(0, 0, 0, 0).attr({
      'class': 'selection-box'
    }).prependTo(group);

    updateSelectionBox(graphics, selectionBox);
  });

  events.on('selection.changed', function(event) {
    var oldSelection = event.oldSelection,
        newSelection = event.newSelection;

    var changed = false;

    _.forEach(oldSelection, function(e) {
      if (newSelection.indexOf(e) == -1) {
        deselect(e);
        changed = true;
      }
    });

    _.forEach(newSelection, function(e) {
      if (oldSelection.indexOf(e) == -1) {
        select(e);
        changed = true;
      }
    });
  });
}

Diagram.plugin('shapeSelection', [ 'events', 'selection', 'shapes', 'interactivity', ShapeSelection ]);

module.exports = ShapeSelection;