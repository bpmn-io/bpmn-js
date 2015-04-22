'use strict';


var getOriginalEvent = require('../../util/Event').getOriginal;

function SelectionBehavior(eventBus, selection, canvas) {

  eventBus.on('create.end', 500, function(e) {
    if (e.context.canExecute) {
      selection.select(e.shape);
    }
  });

  eventBus.on('connect.end', 500, function(e) {
    if (e.context.canExecute && e.context.target) {
      selection.select(e.context.target);
    }
  });

  eventBus.on('shape.move.end', 500, function(e) {
    selection.select(e.context.shapes);
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

    var mouseEvent = (getOriginalEvent(event) || event);

    // leave ALT+click for other use cases
    if (mouseEvent.altKey) {
      return;
    }

    var add = mouseEvent.shiftKey;

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

SelectionBehavior.$inject = [ 'eventBus', 'selection', 'canvas' ];

module.exports = SelectionBehavior;
