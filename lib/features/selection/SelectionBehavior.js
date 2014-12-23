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

  eventBus.on('element.click', function(event) {

    var element = event.element;

    // do not select the root element
    // or connections
    if (element === canvas.getRootElement()) {
      element = null;
    }

    var add = (getOriginalEvent(event) || event).shiftKey;
    selection.select(element, add);
  });
}

SelectionBehavior.$inject = [ 'eventBus', 'selection', 'canvas' ];

module.exports = SelectionBehavior;