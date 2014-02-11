require('../core/Events');

var Diagram = require('../Diagram'),
    _ = require('../util/underscore');

/**
 * @class
 * 
 * A plugin that provides interactivity in terms of events (mouse over and selection to a diagram).
 *
 * @param {Events} events the event bus to attach to
 */
function Interactivity(events) {

  function isCtxSwitch(e) {
    return e.target.parentNode != e.relatedTarget.parentNode;
  }

  function fire(event, baseEvent, eventName) {
    var e = _.extend({}, baseEvent, event);
    events.fire(eventName, e);
  }

  function makeSelectable(element, gfx, options) {
    var dblclick = options.dblclick,
        type = options.type;

    var baseEvent = { element: element, gfx: gfx };

    var parent = gfx.parent();

    // add a slightly bigger event rect
    gfx.clone().attr('class', 'djs-' + type + '-hit').insertBefore(gfx);

    parent.hover(function(e) {
      if (isCtxSwitch(e)) {
        fire(e, baseEvent, type + '.hover');
      }
    }, function(e) {
      if (isCtxSwitch(e)) {
        fire(e, baseEvent, type + '.out');
      }
    });

    parent.click(function(e) {
      fire(e, baseEvent, type + '.click');
    });

    if (dblclick) {
      parent.dblclick(function(e) {
        fire(e, baseEvent, type + '.dblclick');
      });
    }
  }

  function makeConnectionSelectable(connection, gfx) {
    makeSelectable(connection, gfx, { type: 'connection', dblclick: false });
  }

  function makeShapeSelectable(shape, gfx) {
    makeSelectable(shape, gfx, { type: 'shape', dblclick: true });
  }

  function registerEvents(events) {
    events.on('shape.added', function(event) {
      makeShapeSelectable(event.element, event.gfx);
    });

    events.on('connection.added', function(event) {
      makeConnectionSelectable(event.element, event.gfx);
    });
  }

  registerEvents(events);
}

Diagram.plugin('interactivity', [ 'events', Interactivity ]);

module.exports = Interactivity;