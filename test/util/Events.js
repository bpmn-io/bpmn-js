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
    create: function(point, offset) {
      return create(element, point, offset);
    }
  };
}

module.exports.target = target;

function scopedCreate(canvas) {

  var E = target(canvas._svg);

  return function(data) {

    var clientRect = canvas._container.getBoundingClientRect();
    data.x += clientRect.left;
    data.y += clientRect.top;

    return E.create(data);
  };
}

module.exports.scopedCreate = scopedCreate;