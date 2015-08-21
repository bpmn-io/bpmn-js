'use strict';

var hasPrimaryModifier = require('../../util/Mouse').hasPrimaryModifier;


function SelectionBehavior(eventBus, selection, canvas, elementRegistry) {

  eventBus.on('create.end', 500, function(e) {

    // select the created shape after a
    // successful create operation
    if (e.context.canExecute) {
      selection.select(e.context.shape);
    }
  });

  eventBus.on('connect.end', 500, function(e) {

    // select the connect end target
    // after a connect operation
    if (e.context.canExecute && e.context.target) {
      selection.select(e.context.target);
    }
  });

  eventBus.on('shape.move.end', 500, function(e) {
    var previousSelection = e.previousSelection || [];

    var shape = elementRegistry.get(e.context.shape.id);

    // make sure at least the main moved element is being
    // selected after a move operation
    if (shape && previousSelection.indexOf(shape) === -1) {
      selection.select(shape);
    }
  });


  // Shift + click selection
  eventBus.on('element.click', function(event) {

    var element = event.element;

    // do not select the root element
    // or connections
    if (element === canvas.getRootElement()) {
      element = null;
    }

    var isSelected = selection.isSelected(element),
        isMultiSelect = selection.get().length > 1;

    // mouse-event: SELECTION_KEY
    var add = hasPrimaryModifier(event);

    // select OR deselect element in multi selection
    if (isSelected && isMultiSelect) {
      if (add) {
        return selection.deselect(element);
      } else {
        return selection.select(element);
      }
    } else
    if (!isSelected) {
      selection.select(element, add);
    } else {
      selection.deselect(element);
    }
  });
}

SelectionBehavior.$inject = [ 'eventBus', 'selection', 'canvas', 'elementRegistry' ];
module.exports = SelectionBehavior;
