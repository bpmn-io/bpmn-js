'use strict';

var assign = require('lodash/object/assign');

var EventBus = require('../../lib/core/EventBus');

function create(target, point, data) {

  // unwrap snapsvg gfx
  target = target.node || target;

  data = assign({
    target: target,
    clientX: point.x,
    clientY: point.y,
    offsetX: point.x,
    offsetY: point.y
  }, data || {});

  var event = new EventBus.Event();

  event.init(data);

  return event;
}

module.exports.create = create;

function target(element) {
  return {
    create: function(point, data) {
      return create(element, point, data);
    }
  };
}

module.exports.target = target;

function scopedCreate(canvas) {

  var E = target(canvas._svg);

  /**
   * Create an event with global coordinates
   * computed based on the canvas position and the
   * specified canvas local coordinates.
   *
   * @param {Point} point of the event local the canvas (closure)
   * @param {Object} data
   *
   * @return {Event} event, scoped to the given canvas
   */
  return function(point, data) {

    var clientRect = canvas._container.getBoundingClientRect();
    point.x += clientRect.left;
    point.y += clientRect.top;

    return E.create(point, data);
  };
}

module.exports.scopedCreate = scopedCreate;