import {
  assign
} from 'min-dash';

import {
  getBpmnJS
} from 'test/TestHelper';


/**
 * Create an event with global coordinates
 * computed based on the loaded diagrams canvas position and the
 * specified canvas local coordinates.
 *
 * @param {Point} point of the event local the canvas (closure)
 * @param {Object} data
 *
 * @return {Event} event, scoped to the given canvas
 */
export function createCanvasEvent(position, data) {

  return getBpmnJS().invoke(function(canvas) {

    var target = canvas._svg;

    var clientRect = canvas._container.getBoundingClientRect();

    var absolutePosition = {
      x: position.x + clientRect.left,
      y: position.y + clientRect.top
    };

    return createEvent(target, absolutePosition, data);
  });
}


export function createEvent(target, position, data) {

  return getBpmnJS().invoke(function(eventBus) {
    data = assign({
      target: target,
      x: position.x,
      y: position.y,
      clientX: position.x,
      clientY: position.y,
      offsetX: position.x,
      offsetY: position.y
    }, data || {});

    return eventBus.createEvent(data);
  });
}