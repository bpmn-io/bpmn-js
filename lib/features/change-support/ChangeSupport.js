'use strict';

var updateLine = require('../../draw/Renderer').updateLine;

/**
 * Adds change support to the diagram, including
 *
 * <ul>
 *   <li>redrawing shapes and connections on change</li>
 *   <li>updating connection .djs-hit areas</li>
 * </ul>
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 * @param {GraphicsFactory} graphicsFactory
 */
function ChangeSupport(eventBus, elementRegistry, graphicsFactory) {

  // redraw shapes / connections on change

  eventBus.on('element.changed', function(event) {

    if (event.element.waypoints) {
      eventBus.fire('connection.changed', event);
    } else {
      eventBus.fire('shape.changed', event);
    }
  });

  eventBus.on('shape.changed', function(event) {
    var element = event.element;
    graphicsFactory.updateShape(element, event.gfx || elementRegistry.getGraphicsByElement(element));
  });

  eventBus.on('connection.changed', function(event) {
    var element = event.element,
        gfx = event.gfx || elementRegistry.getGraphicsByElement(element);

    // update graphical apperance
    graphicsFactory.updateConnection(element, gfx);

    // update hit area
    var hit = gfx.select('.djs-hit');
    if (hit) {
      updateLine(hit, element.waypoints);
    }
  });
}

ChangeSupport.$inject = [ 'eventBus', 'elementRegistry', 'graphicsFactory' ];

module.exports = ChangeSupport;