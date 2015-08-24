'use strict';

var assign = require('lodash/object/assign');

var EventBus = require('../../lib/core/EventBus');

var TestHelper = require('../helper');


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
function createCanvasEvent(position, data) {

  return TestHelper.getDiagramJS().invoke(function(canvas) {

    var target = canvas._svg;

    var clientRect = canvas._container.getBoundingClientRect();
    position.x += clientRect.left;
    position.y += clientRect.top;

    return createEvent(target, position, data);
  });
}

module.exports.createCanvasEvent = createCanvasEvent;


function createEvent(target, position, data) {

  // unwrap snapsvg gfx
  target = target.node || target;

  data = assign({
    target: target,
    clientX: position.x,
    clientY: position.y,
    offsetX: position.x,
    offsetY: position.y
  }, data || {});

  var event = new EventBus.Event();

  event.init(data);

  return event;
}

module.exports.createEvent = createEvent;