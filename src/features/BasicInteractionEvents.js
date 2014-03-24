require('../core/Events');

require('../draw/Styles');

var Diagram = require('../Diagram'),
    _ = require('lodash'),
    svgUtil = require('../util/svgUtil');

var getVisual = svgUtil.getVisual;

/**
 * @class
 * 
 * A plugin that provides interactivity in terms of events (mouse over and selection to a diagram).
 *
 * @param {Events} events the event bus to attach to
 * @param {Styles} styles to build the interaction shape on
 */
function Interactivity(events, styles) {

  var HIT_STYLE = styles.cls('djs-hit', [ 'no-fill', 'no-border' ]);

  function isCtxSwitch(e) {
    return !e.relatedTarget || e.target.parentNode !== e.relatedTarget.parentNode;
  }

  function fire(event, baseEvent, eventName) {
    var e = _.extend({}, baseEvent, event);
    events.fire(eventName, e);
  }

  function makeSelectable(element, gfx, options) {
    var dblclick = options.dblclick,
        type = options.type;

    var baseEvent = { element: element, gfx: gfx };

    var visual = getVisual(gfx);

    // add a slightly bigger event rect
    visual.clone().attr(HIT_STYLE).prependTo(gfx);

    gfx.hover(function(e) {
      if (isCtxSwitch(e)) {
        fire(e, baseEvent, type + '.hover');
      }
    }, function(e) {
      if (isCtxSwitch(e)) {
        fire(e, baseEvent, type + '.out');
      }
    });

    gfx.click(function(e) {
      fire(e, baseEvent, type + '.click');
    });

    gfx.dblclick(function(e) {
      fire(e, baseEvent, type + '.dblclick');
    });
  }

  function makeConnectionSelectable(connection, gfx) {
    makeSelectable(connection, gfx, { type: 'connection' });
  }

  function makeShapeSelectable(shape, gfx) {
    makeSelectable(shape, gfx, { type: 'shape' });
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

Diagram.plugin('basicInteractionEvents', [ 'events', 'styles', Interactivity ]);

module.exports = Interactivity;