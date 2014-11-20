'use strict';

var updateLine = require('../../draw/Renderer').updateLine;

/**
 * Adds change support to the diagram, including
 *
 * <ul>
 *   <li>redrawing shapes and connections on change</li>
 * </ul>
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 * @param {GraphicsFactory} graphicsFactory
 */
function ChangeSupport(eventBus, elementRegistry, graphicsFactory) {

  // redraw shapes / connections on change

  eventBus.on('element.changed', function(event) {

    var element = event.element;

    if (!event.gfx) {
      event.gfx = elementRegistry.getGraphics(element);
    }

    // shape + gfx may have been deleted
    if (!event.gfx) {
      return;
    }

    if (element.waypoints) {
      eventBus.fire('connection.changed', event);
    } else {
      eventBus.fire('shape.changed', event);
    }
  });

  eventBus.on('shape.changed', function(event) {
    graphicsFactory.updateShape(event.element, event.gfx);
  });

  eventBus.on('connection.changed', function(event) {
    graphicsFactory.updateConnection(event.element, event.gfx);
  });
}

ChangeSupport.$inject = [ 'eventBus', 'elementRegistry', 'graphicsFactory' ];

module.exports = ChangeSupport;
