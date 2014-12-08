var _ = require('lodash');

var EventBus = require('../../lib/core/EventBus');

function create(target, point, data) {

  // unwrap snapsvg gfx
  target = target.node || target;

  data = _.extend({
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